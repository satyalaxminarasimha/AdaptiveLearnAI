# Quiz Platform Integration Guide

## Project Structure

```
adaptive-learn-ai/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── ai/
│   │           ├── process-textbook/       # Upload & process PDFs
│   │           ├── semantic-search/        # Search chunks
│   │           ├── chunks/                 # Get chunks by unit
│   │           └── processed-textbooks/    # Manage metadata
│   ├── components/
│   │   └── textbook-processing-panel.tsx   # Admin UI
│   ├── models/
│   │   └── ProcessedTextbook.ts            # MongoDB model
│   └── lib/
│       └── python-service.ts               # Python service client
├── python-services/
│   └── quiz_platform/
│       ├── api.py                          # FastAPI server
│       ├── config.py                       # Configuration
│       ├── database.py                     # MongoDB connection
│       ├── pipeline.py                     # Main processing
│       ├── unit_mapper.py                  # Semantic mapping
│       ├── vector_database.py              # FAISS indexing
│       ├── syllabus_extractor.py          # PDF extraction
│       ├── textbook_extractor.py          # PDF extraction
│       ├── text_chunker.py                # Text chunking
│       ├── requirements.txt                # Python dependencies
│       └── data/                           # Uploads & indexes
└── ... (existing files)
```

## Features Integrated

1. **Textbook Processing**
   - Upload textbook & syllabus PDFs
   - Automatic text extraction
   - Semantic chunking (300-500 words)
   - Unit-to-chunk mapping using embeddings
   - FAISS vector indexing for fast search

2. **Semantic Search**
   - Search across textbook chunks
   - Filter by unit/topic
   - Relevance scoring
   - Integration with quiz generation

3. **Metadata Management**
   - MongoDB storage of processing results
   - Track processed textbooks
   - Extract quality metrics
   - Unit distribution statistics

## Installation

### 1. MongoDB Setup

Ensure MongoDB is running:
```bash
# Windows (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

### 2. Python Service Setup

```bash
cd python-services/quiz_platform

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Update .env with MongoDB URL
# MONGODB_URL=mongodb://localhost:27017
# MONGODB_DATABASE=adaptivelearnai
```

### 3. Next.js Setup

```bash
# Install dependencies
npm install

# Update .env.local
# PYTHON_SERVICE_URL=http://localhost:8000
# NEXT_PUBLIC_PYTHON_SERVICE_URL=http://localhost:8000

# Run development server
npm run dev
```

## Running the Application

### Terminal 1: Python Service
```bash
cd python-services/quiz_platform
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2: Next.js App
```bash
npm run dev
# App runs on http://localhost:9002
```

## Usage

### 1. Upload Textbook (Admin Dashboard)

1. Go to Admin Dashboard → Manage Content (or new AI/Textbooks section)
2. Click "Process Textbook"
3. Fill in textbook metadata:
   - Textbook ID (unique identifier)
   - Textbook Name
   - Batch/Year (optional)
   - Section (optional)
4. Upload textbook PDF
5. Upload syllabus PDF
6. Click "Process Textbook"
7. Wait for processing to complete
8. View extraction results and statistics

### 2. Search Content via API

```typescript
// Using the Python service client
import { pythonService } from '@/lib/python-service';

const results = await pythonService.searchContent(
  'photosynthesis',
  'bio_101',
  5,
  1  // Unit 1 (optional)
);
```

### 3. Get Chunks for Quiz Generation

```typescript
// Get chunks for a specific unit
const chunks = await pythonService.getChunks('bio_101', 1);

// Use chunks in quiz generation flow
const quizzes = await genkit.generateQuizFromContent({
  chunks: chunks.data,
  unitNumber: 1,
  difficulty: 'medium'
});
```

## API Endpoints

### Python Service (FastAPI)
- `POST /process` - Upload and process textbook-syllabus pair
- `GET /textbooks` - List processed textbooks
- `GET /textbooks/{id}` - Get textbook details
- `POST /search` - Semantic search across chunks
- `GET /chunks/{textbook_id}` - Get chunks with pagination
- `GET /health` - Health check

### Next.js Proxy Routes
- `POST /api/ai/process-textbook` - Forward to Python service
- `POST /api/ai/semantic-search` - Forward to Python service
- `GET /api/ai/chunks/[textbookId]` - Forward to Python service
- `GET /api/ai/processed-textbooks` - Get from MongoDB

## Integration with Quiz Generation

The extracted chunks can be used to enhance quiz generation:

```typescript
// In src/ai/flows/generate-quiz-from-content.ts
import { defineFlow, defineTool } from '@genkit-ai/flow';
import { pythonService } from '@/lib/python-service';

export const generateQuizFromContent = defineFlow(
  {
    name: 'generateQuizFromContent',
    inputType: z.object({
      textbookId: z.string(),
      unitNumber: z.number(),
      numberOfQuestions: z.number().default(5),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    }),
    outputType: z.object({
      questions: z.array(
        z.object({
          text: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number(),
          source: z.string(), // Chunk ID
        })
      ),
    }),
  },
  async (input) => {
    // Get chunks from Python service
    const chunkResults = await pythonService.getChunks(
      input.textbookId,
      input.unitNumber,
      0,
      100
    );

    if (!chunkResults.data || chunkResults.data.length === 0) {
      throw new Error('No content found for this unit');
    }

    // Generate questions from chunks using Claude
    const prompt = `Generate ${input.numberOfQuestions} ${input.difficulty} multiple choice questions based on this content:\n\n${chunkResults.data
      .slice(0, 10)
      .map((c: any) => c.text)
      .join('\n\n')}`;

    // ... rest of generation logic
  }
);
```

## Configuration

Edit `python-services/quiz_platform/.env`:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=adaptivelearnai

# Text Processing
CHUNK_MIN_WORDS=300
CHUNK_MAX_WORDS=500
CHUNK_OVERLAP_WORDS=50

# Embeddings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# Similarity
SIMILARITY_THRESHOLD=0.35

# Server
HOST=127.0.0.1
PORT=8000
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or Docker container is started
- Check connection string in `.env`

### Python Service Not Responding
- Check if service is running on port 8000
- Verify `PYTHON_SERVICE_URL` in Next.js `.env.local`
- Check Python service logs for errors

### PDF Processing Fails
- Ensure PDF files are valid
- Check file permissions
- Verify `data/uploads` directory exists

### Embedding Model Download Fails
- Check internet connection
- Model downloads on first use (may take time)
- Model is cached locally after first download

## Performance Tips

1. **Batch Processing**: Process multiple textbooks in sequence, not parallel
2. **Chunk Size**: Adjust `CHUNK_MIN_WORDS` and `CHUNK_MAX_WORDS` for your content
3. **Similarity Threshold**: Lower threshold catches more content, higher is more selective
4. **Vector Search**: FAISS provides fast search for large chunk sets
5. **Caching**: Consider caching search results in Redis

## Next Steps

1. ✓ Set up Python microservice
2. ✓ Configure MongoDB integration
3. ✓ Create admin UI for textbook uploads
4. → Integrate with quiz generation flows
5. → Add semantic search to professor dashboard
6. → Create content analytics dashboard
7. → Add batch processing capabilities

## Support

For issues or questions:
1. Check logs in both Next.js and Python service terminals
2. Verify all environment variables are set
3. Test Python service health: `GET http://localhost:8000/health`
4. Test MongoDB connection with MongoDB Compass
