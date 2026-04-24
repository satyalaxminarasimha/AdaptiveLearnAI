# Quiz Platform - Python Service

Fast API microservice for semantic textbook processing with MongoDB integration.

## Features

- **PDF Text Extraction**: Extract text from textbook and syllabus PDFs
- **Intelligent Chunking**: Split content into semantic chunks (300-500 words)
- **Semantic Embeddings**: Use sentence-transformers for semantic understanding
- **Unit Mapping**: Map chunks to syllabus units using cosine similarity
- **Vector Search**: FAISS-based semantic search across chunks
- **MongoDB Integration**: Store metadata and processing results

## Quick Start

### 1. Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from template)
cp .env.example .env
```

### 2. Configure MongoDB

Edit `.env`:
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=adaptivelearnai
```

### 3. Run Service

```bash
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

Service will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

## Configuration

Key settings in `.env`:

```env
# Text Chunking
CHUNK_MIN_WORDS=300      # Minimum chunk size
CHUNK_MAX_WORDS=500      # Maximum chunk size
CHUNK_OVERLAP_WORDS=50   # Overlap between chunks

# Semantic Mapping
SIMILARITY_THRESHOLD=0.35  # Min similarity to assign to unit

# Embeddings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
```

## API Endpoints

### Process Textbook
```bash
POST /process
Content-Type: multipart/form-data

Parameters:
- textbook (file): Textbook PDF
- syllabus (file): Syllabus PDF
- textbook_id (string): Unique identifier
- textbook_name (string): Display name
- batch (string, optional): Batch/Year
- section (string, optional): Section
```

### List Textbooks
```bash
GET /textbooks?batch=2022&section=A
```

### Get Textbook Details
```bash
GET /textbooks/{textbook_id}
```

### Semantic Search
```bash
POST /search?query=photosynthesis&textbook_id=bio_101&k=5
```

### Get Chunks
```bash
GET /chunks/{textbook_id}?unit_number=1&skip=0&limit=50
```

### Health Check
```bash
GET /health
```

## Module Overview

### config.py
Configuration management using environment variables.

### database.py
MongoDB connection and repository classes:
- `TextbookRepository`: Textbook metadata operations
- `ChunkRepository`: Chunk data operations
- `SyllabusRepository`: Syllabus operations

### pipeline.py
Main processing pipeline orchestrating:
1. Syllabus extraction
2. Textbook extraction
3. Text chunking
4. Unit mapping
5. Vector database storage

### syllabus_extractor.py
Extracts units and topics from syllabus PDFs using pattern matching.

### textbook_extractor.py
Extracts text from textbook PDFs with page-level tracking.

### text_chunker.py
Intelligently chunks text based on paragraphs and word count constraints.

### unit_mapper.py
Maps chunks to syllabus units using semantic similarity:
- Generates embeddings for chunks and units
- Calculates cosine similarity
- Assigns chunks to best matching unit

### vector_database.py
Manages FAISS vector index:
- Creates and maintains indexes
- Stores chunk embeddings
- Performs semantic search

## Performance Considerations

- **First Run**: Embedding model downloads on first use (~500MB)
- **Processing Time**: ~5-15 seconds per typical textbook
- **Memory**: 2-4GB recommended for embedding model
- **Disk**: ~1GB per 1000 chunks stored
- **Search Speed**: <100ms per query with FAISS

## Troubleshooting

### MongoDB Connection Failed
```
Check:
- MongoDB is running
- Connection string in .env is correct
- Firewall allows port 27017
```

### Embedding Model Download Fails
```
Solution:
- Check internet connection
- Manual download: from sentence_transformers import SentenceTransformer
  model = SentenceTransformer('all-MiniLM-L6-v2')
```

### PDF Processing Error
```
Check:
- PDF files are valid
- File permissions
- Sufficient disk space in data/uploads
```

## Development

### Run Tests
```bash
# Coming soon
pytest tests/
```

### Run with Hot Reload
```bash
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

### Check Logs
All operations are logged to console with progress indicators.

## Next Steps

1. Set up MongoDB
2. Install dependencies
3. Configure .env
4. Run service
5. Upload textbooks via Next.js admin panel
6. Use semantic search in quiz generation

## Architecture

```
Request
  ↓
FastAPI Route Handler
  ↓
MongoDB Repository (read/write)
  ↓
Processing Pipeline
  ├── Syllabus Extractor
  ├── Textbook Extractor
  ├── Text Chunker
  ├── Unit Mapper
  └── Vector Database
  ↓
Response + MongoDB Storage
```

## Integration with Next.js

The service is accessed through Next.js proxy routes:
- `/api/ai/process-textbook` → `POST /process`
- `/api/ai/semantic-search` → `POST /search`
- `/api/ai/chunks/[textbookId]` → `GET /chunks/{id}`

This allows:
- Same-origin requests (no CORS issues)
- Authentication via Next.js middleware
- Data persistence in MongoDB
