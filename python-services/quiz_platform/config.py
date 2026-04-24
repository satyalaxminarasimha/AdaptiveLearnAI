"""
Configuration settings for the MongoDB-based quiz platform.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration settings."""
    
    # MongoDB Configuration
    MONGODB_URL = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017"
    )
    MONGODB_DATABASE = os.getenv(
        "MONGODB_DATABASE",
        "adaptivelearnai"
    )
    
    # Embedding Model Configuration
    EMBEDDING_MODEL = os.getenv(
        "EMBEDDING_MODEL",
        "sentence-transformers/all-MiniLM-L6-v2"
    )
    EMBEDDING_DIMENSION = int(os.getenv("EMBEDDING_DIMENSION", "384"))
    
    # Chunking Configuration
    CHUNK_MIN_WORDS = int(os.getenv("CHUNK_MIN_WORDS", "300"))
    CHUNK_MAX_WORDS = int(os.getenv("CHUNK_MAX_WORDS", "500"))
    CHUNK_OVERLAP_WORDS = int(os.getenv("CHUNK_OVERLAP_WORDS", "50"))
    
    # Semantic Similarity Configuration
    SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.35"))
    
    # Vector Database Configuration
    FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "data/faiss_indexes")
    VECTOR_STORAGE_BACKEND = os.getenv("VECTOR_STORAGE_BACKEND", "mongo")
    ENABLE_FAISS_CACHE = os.getenv("ENABLE_FAISS_CACHE", "false").lower() == "true"
    MONGO_VECTOR_SEARCH_CANDIDATES = int(os.getenv("MONGO_VECTOR_SEARCH_CANDIDATES", "2000"))
    
    # PDF Processing Configuration
    REMOVE_HEADERS_FOOTERS = True
    MIN_TEXT_LENGTH = 50  # Minimum characters for valid chunk
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "data/uploads")
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "104857600"))  # 100MB
    
    # Number of units per syllabus
    NUM_UNITS = int(os.getenv("NUM_UNITS", "5"))
    
    # Server Configuration
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "8000"))


settings = Settings()
