"""
FastAPI application for the MongoDB-integrated quiz platform.
Provides REST API endpoints for processing textbooks and semantic search.
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from datetime import datetime
import numpy as np

from config import settings
from database import connect_to_mongo, close_mongo_connection, TextbookRepository, ChunkRepository, SyllabusRepository
from pipeline import ProcessingPipeline
from vector_database import VectorDatabase

# Initialize FastAPI app
app = FastAPI(
    title="Quiz Platform - Content Extraction API",
    description="API for processing textbooks and syllabi with MongoDB integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pipeline
pipeline = ProcessingPipeline()


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    print("Starting Quiz Platform API...")
    
    # Connect to MongoDB
    await connect_to_mongo()
    
    # Create upload directories
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
    print("✓ Upload directories created")
    print(f"✓ API running on {settings.HOST}:{settings.PORT}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    await close_mongo_connection()
    print("✓ Quiz Platform API shutdown")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Quiz Platform - Content Extraction API",
        "version": "1.0.0",
        "description": "Process textbooks and syllabi for quiz generation",
        "endpoints": {
            "process": "POST /process - Upload and process textbook-syllabus pair",
            "textbooks": "GET /textbooks - List all processed textbooks",
            "textbook": "GET /textbooks/{textbook_id} - Get textbook details",
            "metadata": "GET /textbooks/{textbook_id}/metadata - Get units and mapping stats",
            "search": "POST /search - Search for similar content",
            "chunks": "GET /chunks/{textbook_id} - Get chunks for textbook",
            "health": "GET /health - Service health",
            "capabilities": "GET /capabilities - Pipeline and API capabilities"
        }
    }


@app.get("/capabilities")
async def capabilities():
    """Describe implemented extraction and retrieval capabilities."""
    return {
        "status": "success",
        "pipeline": [
            "Extract syllabus units and topics from PDF",
            "Extract textbook text page-by-page",
            "Chunk textbook text into 300-500 words",
            "Map chunks to syllabus units using MiniLM embeddings",
            "Store chunk embeddings in MongoDB",
            "Search embeddings from MongoDB (FAISS fallback for legacy indexes)",
            "Store textbook/chunk/syllabus metadata in MongoDB"
        ],
        "api": {
            "process": "POST /process",
            "textbooks": "GET /textbooks",
            "textbook": "GET /textbooks/{textbook_id}",
            "metadata": "GET /textbooks/{textbook_id}/metadata",
            "chunks": "GET /chunks/{textbook_id}",
            "search": "POST /search",
            "health": "GET /health"
        }
    }


@app.post("/process")
async def process_textbook_syllabus(
    textbook: UploadFile = File(..., description="Textbook PDF file"),
    syllabus: UploadFile = File(..., description="Syllabus PDF file"),
    textbook_id: str = Form(..., description="Unique identifier for textbook"),
    textbook_name: str = Form(..., description="Display name for textbook"),
    batch: str = Form(default="", description="Batch/Year"),
    section: str = Form(default="", description="Section"),
    subject: str = Form(default="", description="Subject name"),
):
    """
    Process a textbook-syllabus pair through the complete pipeline.
    
    Returns:
    - Processing results and statistics
    """
    try:
        # Validate file types
        if textbook.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Textbook must be a PDF file")
        if syllabus.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Syllabus must be a PDF file")
        
        # Create temp directory for uploads
        temp_dir = os.path.join(settings.UPLOAD_FOLDER, textbook_id)
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded files
        textbook_path = os.path.join(temp_dir, "textbook.pdf")
        syllabus_path = os.path.join(temp_dir, "syllabus.pdf")
        
        with open(textbook_path, "wb") as f:
            content = await textbook.read()
            f.write(content)
        
        with open(syllabus_path, "wb") as f:
            content = await syllabus.read()
            f.write(content)
        
        # Process the textbook-syllabus pair
        results = pipeline.process_textbook_syllabus_pair(
            textbook_path=textbook_path,
            syllabus_path=syllabus_path,
            textbook_id=textbook_id,
            textbook_name=textbook_name
        )
        
        # Save to MongoDB
        textbook_record = {
            "textbook_id": textbook_id,
            "name": textbook_name,
            "batch": batch,
            "section": section,
            "subject": subject,
            "file_path": textbook_path,
            "upload_date": datetime.utcnow(),
            "total_chunks": results["total_chunks"],
            "valid_chunks": results["valid_chunks"],
            "processed": True,
            "units": results.get("units", []),
            "chunks_per_unit": results.get("chunks_per_unit", {}),
            "processing_stats": results
        }
        
        await TextbookRepository.upsert(textbook_id, textbook_record)

        syllabus_record = {
            "textbook_id": textbook_id,
            "batch": batch,
            "section": section,
            "subject": subject,
            "units": results.get("units", []),
            "source_file": syllabus.filename,
            "updated_at": datetime.utcnow(),
        }
        await SyllabusRepository.upsert_for_textbook(textbook_id, syllabus_record)
        
        # Save chunks and embeddings to MongoDB
        await ChunkRepository.delete_by_textbook(textbook_id)
        chunks_to_save = []
        mapped_chunks = results.get("mapped_chunks", [])
        valid_chunks = [c for c in mapped_chunks if not c.get('is_out_of_syllabus', True)]
        chunk_embeddings = pipeline.unit_mapper.get_embeddings_batch([
            chunk.get("text", "") for chunk in valid_chunks
        ]) if valid_chunks else np.array([], dtype=np.float32)

        for i, chunk in enumerate(valid_chunks):
            embedding = chunk_embeddings[i].tolist() if len(chunk_embeddings) > i else []
            chunks_to_save.append({
                "chunk_id": chunk.get("chunk_id"),
                "textbook_id": textbook_id,
                "text": chunk.get("text"),
                "assigned_unit_number": chunk.get("assigned_unit_number"),
                "page_number": chunk.get("page_number"),
                "word_count": chunk.get("word_count"),
                "similarity_score": chunk.get("similarity_score"),
                "is_out_of_syllabus": chunk.get("is_out_of_syllabus", False),
                "embedding_model": settings.EMBEDDING_MODEL,
                "embedding_dimension": settings.EMBEDDING_DIMENSION,
                "embedding": embedding,
            })
        
        if chunks_to_save:
            await ChunkRepository.create_many(chunks_to_save)
        
        return {
            "status": "success",
            "message": "Textbook processed successfully",
            "data": results
        }
    
    except Exception as e:
        print(f"Error processing textbook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/textbooks")
async def list_textbooks(batch: Optional[str] = None, section: Optional[str] = None):
    """List all processed textbooks."""
    try:
        textbooks = await TextbookRepository.list_all(batch=batch, section=section)
        return {
            "status": "success",
            "count": len(textbooks),
            "data": textbooks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/textbooks/{textbook_id}")
async def get_textbook(textbook_id: str):
    """Get textbook details."""
    try:
        textbook = await TextbookRepository.find_by_id(textbook_id)
        if not textbook:
            raise HTTPException(status_code=404, detail="Textbook not found")
        
        chunk_count = await ChunkRepository.count_by_textbook(textbook_id)
        textbook["chunk_count"] = chunk_count
        
        return {
            "status": "success",
            "data": textbook
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def search_content(
    query: str,
    textbook_id: str,
    k: int = 5,
    unit_number: Optional[int] = None
):
    """Search for similar content in processed textbooks."""
    try:
        candidates = await ChunkRepository.find_search_candidates(
            textbook_id=textbook_id,
            unit_number=unit_number,
            limit=settings.MONGO_VECTOR_SEARCH_CANDIDATES,
        )

        results = []
        query_vec = pipeline.unit_mapper.get_embeddings(query).astype(np.float32)
        query_norm = np.linalg.norm(query_vec)

        if candidates and query_norm > 0:
            valid_rows = []
            matrix = []
            for row in candidates:
                emb = row.get("embedding")
                if isinstance(emb, list) and len(emb) == settings.EMBEDDING_DIMENSION:
                    vec = np.array(emb, dtype=np.float32)
                    norm = np.linalg.norm(vec)
                    if norm > 0:
                        valid_rows.append((row, norm))
                        matrix.append(vec)

            if matrix:
                matrix_np = np.vstack(matrix)
                similarities = (matrix_np @ query_vec) / (np.linalg.norm(matrix_np, axis=1) * query_norm)
                top_k_idx = np.argsort(similarities)[::-1][: max(1, k)]

                for idx in top_k_idx:
                    row, _norm = valid_rows[int(idx)]
                    similarity = float(similarities[int(idx)])
                    results.append({
                        "chunk_id": row.get("chunk_id"),
                        "textbook_id": row.get("textbook_id"),
                        "unit_number": row.get("assigned_unit_number"),
                        "page_number": row.get("page_number"),
                        "text": row.get("text"),
                        "word_count": row.get("word_count"),
                        "similarity_score": row.get("similarity_score"),
                        "similarity": similarity,
                        "distance": float(1.0 - similarity),
                    })

        # Backward compatibility: fallback to FAISS indexes when Mongo vectors are unavailable.
        if not results:
            vector_db = VectorDatabase(textbook_id)
            if vector_db.load():
                results = vector_db.search(query, k=k, unit_filter=unit_number)
        
        return {
            "status": "success",
            "query": query,
            "textbook_id": textbook_id,
            "results_count": len(results),
            "data": results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chunks/{textbook_id}")
async def get_chunks(
    textbook_id: str,
    unit_number: Optional[int] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get chunks for a textbook."""
    try:
        if unit_number is not None:
            chunks = await ChunkRepository.find_by_unit(unit_number, textbook_id)
        else:
            chunks = await ChunkRepository.find_by_textbook(textbook_id)
        
        paginated_chunks = chunks[skip:skip + limit]
        
        return {
            "status": "success",
            "textbook_id": textbook_id,
            "unit_number": unit_number,
            "total_count": len(chunks),
            "returned_count": len(paginated_chunks),
            "skip": skip,
            "limit": limit,
            "data": paginated_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/textbooks/{textbook_id}/metadata")
async def get_textbook_metadata(textbook_id: str):
    """Get unit extraction and mapping metadata for a textbook."""
    try:
        textbook = await TextbookRepository.find_by_id(textbook_id)
        if not textbook:
            raise HTTPException(status_code=404, detail="Textbook not found")

        chunks = await ChunkRepository.find_by_textbook(textbook_id)
        unit_distribution = {}
        for chunk in chunks:
            unit = chunk.get("assigned_unit_number")
            if unit is None:
                continue
            unit_distribution[str(unit)] = unit_distribution.get(str(unit), 0) + 1

        return {
            "status": "success",
            "data": {
                "textbook_id": textbook_id,
                "name": textbook.get("name"),
                "subject": textbook.get("subject"),
                "batch": textbook.get("batch"),
                "section": textbook.get("section"),
                "units": textbook.get("units", []),
                "chunks_per_unit": textbook.get("chunks_per_unit", unit_distribution),
                "total_chunks": textbook.get("total_chunks", len(chunks)),
                "valid_chunks": textbook.get("valid_chunks", len(chunks)),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
