# Vercel + Python AI Service Deployment

This app can be deployed to Vercel, but the Python quiz service must run separately.

## Why

Vercel Serverless Functions in this project run Next.js API routes. The local FastAPI service used for textbook processing and semantic search is not hosted automatically by Vercel.

## Required Architecture

1. Deploy Next.js app to Vercel.
2. Deploy Python service from `python-services/quiz_platform` to a separate host:
- Railway
- Render
- Fly.io
- Azure Web App / VM
- Any container host
3. Set Vercel environment variable:
- `PYTHON_SERVICE_URL=https://your-python-service.example.com`

## What Was Updated

- Next.js AI proxy routes now use `PYTHON_SERVICE_URL` in production and do not fall back to `localhost` on Vercel.
- Python service now stores chunk embeddings in MongoDB and serves semantic search from Mongo vectors.

## Python Service Environment

Set these in the Python deployment:

- `MONGODB_URL` (Atlas URI or managed Mongo URI)
- `MONGODB_DATABASE`
- `VECTOR_STORAGE_BACKEND=mongo`
- `ENABLE_FAISS_CACHE=false` (optional)
- `MONGO_VECTOR_SEARCH_CANDIDATES=2000`

## Verify

1. `GET {PYTHON_SERVICE_URL}/health` should return healthy.
2. In Vercel app, calling `/api/ai/capabilities` should proxy successfully.
3. Textbook processing and semantic search routes should return data without `localhost:8000` errors.
