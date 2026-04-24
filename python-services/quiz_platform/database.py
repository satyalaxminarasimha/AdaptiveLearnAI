"""
MongoDB database layer for the quiz platform.
Handles all database operations with MongoDB.
"""
from motor.motor_asyncio import AsyncClient, AsyncDatabase
from pymongo import ASCENDING, DESCENDING, TEXT
from datetime import datetime
from typing import Optional, List, Dict, Any
import os

from config import settings


class MongoDBConnection:
    """MongoDB connection manager."""
    
    client: Optional[AsyncClient] = None
    db: Optional[AsyncDatabase] = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    MongoDBConnection.client = AsyncClient(settings.MONGODB_URL)
    MongoDBConnection.db = MongoDBConnection.client[settings.MONGODB_DATABASE]
    
    # Create indexes
    await create_indexes()
    print("✓ Connected to MongoDB")


async def close_mongo_connection():
    """Close MongoDB connection."""
    if MongoDBConnection.client:
        MongoDBConnection.client.close()
        print("✓ Disconnected from MongoDB")


async def create_indexes():
    """Create necessary MongoDB indexes."""
    db = MongoDBConnection.db
    
    # Textbooks collection
    await db.textbooks.create_index([("textbook_id", ASCENDING)], unique=True)
    await db.textbooks.create_index([("batch", ASCENDING), ("section", ASCENDING)])
    
    # Chunks collection
    await db.chunks.create_index([("chunk_id", ASCENDING)], unique=True)
    await db.chunks.create_index([("textbook_id", ASCENDING)])
    await db.chunks.create_index([("assigned_unit_number", ASCENDING)])
    await db.chunks.create_index([("textbook_id", ASCENDING), ("assigned_unit_number", ASCENDING)])
    
    # Syllabi collection
    await db.syllabi.create_index([("batch", ASCENDING), ("section", ASCENDING)])
    
    print("✓ MongoDB indexes created")


def get_database() -> AsyncDatabase:
    """Get database instance."""
    return MongoDBConnection.db


# Collection operations

class TextbookRepository:
    """Repository for textbook operations."""
    
    @staticmethod
    async def create(textbook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new textbook record."""
        db = get_database()
        textbook = {
            **textbook_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.textbooks.insert_one(textbook)
        textbook["_id"] = result.inserted_id
        return textbook

    @staticmethod
    async def upsert(textbook_id: str, textbook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update textbook record by textbook_id."""
        db = get_database()
        payload = {
            **textbook_data,
            "updated_at": datetime.utcnow(),
        }
        await db.textbooks.update_one(
            {"textbook_id": textbook_id},
            {
                "$set": payload,
                "$setOnInsert": {"created_at": datetime.utcnow()}
            },
            upsert=True
        )
        return await TextbookRepository.find_by_id(textbook_id)
    
    @staticmethod
    async def find_by_id(textbook_id: str) -> Optional[Dict[str, Any]]:
        """Find textbook by ID."""
        db = get_database()
        return await db.textbooks.find_one({"textbook_id": textbook_id})
    
    @staticmethod
    async def update(textbook_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update textbook record."""
        db = get_database()
        update_data["updated_at"] = datetime.utcnow()
        await db.textbooks.update_one(
            {"textbook_id": textbook_id},
            {"$set": update_data}
        )
        return await TextbookRepository.find_by_id(textbook_id)
    
    @staticmethod
    async def list_all(batch: Optional[str] = None, section: Optional[str] = None) -> List[Dict]:
        """List all textbooks with optional filters."""
        db = get_database()
        query = {}
        if batch:
            query["batch"] = batch
        if section:
            query["section"] = section
        return await db.textbooks.find(query).to_list(None)


class ChunkRepository:
    """Repository for chunk operations."""
    
    @staticmethod
    async def create_many(chunks: List[Dict[str, Any]]) -> List[str]:
        """Create multiple chunk records."""
        db = get_database()
        if not chunks:
            return []
        chunks_with_ts = [
            {**chunk, "created_at": datetime.utcnow()}
            for chunk in chunks
        ]
        result = await db.chunks.insert_many(chunks_with_ts)
        return [str(id) for id in result.inserted_ids]
    
    @staticmethod
    async def find_by_unit(unit_number: int, textbook_id: str) -> List[Dict]:
        """Find chunks by unit number and textbook."""
        db = get_database()
        return await db.chunks.find({
            "assigned_unit_number": unit_number,
            "textbook_id": textbook_id,
            "is_out_of_syllabus": False
        }).to_list(None)
    
    @staticmethod
    async def find_by_textbook(textbook_id: str) -> List[Dict]:
        """Find all chunks for a textbook."""
        db = get_database()
        return await db.chunks.find({
            "textbook_id": textbook_id
        }).to_list(None)

    @staticmethod
    async def find_search_candidates(
        textbook_id: str,
        unit_number: Optional[int] = None,
        limit: int = 2000
    ) -> List[Dict]:
        """Find chunk vectors for semantic search."""
        db = get_database()
        query: Dict[str, Any] = {
            "textbook_id": textbook_id,
            "is_out_of_syllabus": False,
            "embedding": {"$exists": True}
        }
        if unit_number is not None:
            query["assigned_unit_number"] = unit_number

        projection = {
            "_id": 0,
            "chunk_id": 1,
            "textbook_id": 1,
            "assigned_unit_number": 1,
            "page_number": 1,
            "text": 1,
            "word_count": 1,
            "similarity_score": 1,
            "embedding": 1,
        }

        cursor = db.chunks.find(query, projection).limit(max(1, limit))
        return await cursor.to_list(length=max(1, limit))
    
    @staticmethod
    async def count_by_textbook(textbook_id: str) -> int:
        """Count chunks for a textbook."""
        db = get_database()
        return await db.chunks.count_documents({"textbook_id": textbook_id})

    @staticmethod
    async def delete_by_textbook(textbook_id: str) -> int:
        """Delete all chunks for a textbook (used before re-insert on re-processing)."""
        db = get_database()
        result = await db.chunks.delete_many({"textbook_id": textbook_id})
        return result.deleted_count


class SyllabusRepository:
    """Repository for syllabus operations."""
    
    @staticmethod
    async def create(syllabus_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new syllabus record."""
        db = get_database()
        syllabus = {
            **syllabus_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.syllabi.insert_one(syllabus)
        syllabus["_id"] = result.inserted_id
        return syllabus

    @staticmethod
    async def upsert_for_textbook(textbook_id: str, syllabus_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update syllabus metadata linked to a processed textbook."""
        db = get_database()
        payload = {
            **syllabus_data,
            "textbook_id": textbook_id,
            "updated_at": datetime.utcnow(),
        }
        await db.syllabi.update_one(
            {"textbook_id": textbook_id},
            {
                "$set": payload,
                "$setOnInsert": {"created_at": datetime.utcnow()}
            },
            upsert=True
        )
        return await db.syllabi.find_one({"textbook_id": textbook_id})
    
    @staticmethod
    async def find_by_batch_section(batch: str, section: str) -> Optional[Dict[str, Any]]:
        """Find syllabus by batch and section."""
        db = get_database()
        return await db.syllabi.find_one({
            "batch": batch,
            "section": section
        })
    
    @staticmethod
    async def update(syllabus_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update syllabus record."""
        db = get_database()
        from bson.objectid import ObjectId
        update_data["updated_at"] = datetime.utcnow()
        await db.syllabi.update_one(
            {"_id": ObjectId(syllabus_id)},
            {"$set": update_data}
        )
        return await db.syllabi.find_one({"_id": ObjectId(syllabus_id)})


# Initialize database on startup
__all__ = [
    "connect_to_mongo",
    "close_mongo_connection",
    "get_database",
    "TextbookRepository",
    "ChunkRepository",
    "SyllabusRepository"
]
