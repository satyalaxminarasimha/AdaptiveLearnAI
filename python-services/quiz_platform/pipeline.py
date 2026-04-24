"""
Main processing pipeline.
Orchestrates the complete workflow from PDF ingestion to vector storage.
"""
from datetime import datetime
from typing import Dict, List, Any
import os

from config import settings
from syllabus_extractor import SyllabusExtractor
from textbook_extractor import TextbookExtractor
from text_chunker import TextChunker
from unit_mapper import UnitMapper
from vector_database import VectorDatabase


class ProcessingPipeline:
    """Main pipeline for processing textbook-syllabus pairs."""
    
    def __init__(self):
        """Initialize pipeline with all required components."""
        self.syllabus_extractor = SyllabusExtractor()
        self.textbook_extractor = TextbookExtractor()
        self.text_chunker = TextChunker()
        self.unit_mapper = UnitMapper()
    
    def process_textbook_syllabus_pair(
        self,
        textbook_path: str,
        syllabus_path: str,
        textbook_id: str,
        textbook_name: str
    ) -> Dict[str, Any]:
        """
        Process a complete textbook-syllabus pair through the entire pipeline.
        
        Args:
            textbook_path: Path to textbook PDF
            syllabus_path: Path to syllabus PDF
            textbook_id: Unique identifier for textbook
            textbook_name: Display name for textbook
            
        Returns:
            Dictionary with processing results and statistics
        """
        print(f"\n{'='*80}")
        print(f"Processing Textbook-Syllabus Pair")
        print(f"{'='*80}")
        print(f"Textbook ID: {textbook_id}")
        print(f"Textbook Name: {textbook_name}")
        print(f"{'='*80}\n")
        
        start_time = datetime.now()
        
        # Step 1: Extract syllabus
        print("[Step 1/6] Extracting syllabus units and topics...")
        units = self.syllabus_extractor.extract_syllabus(syllabus_path)
        print(f"✓ Extracted {len(units)} units from syllabus")
        for unit in units:
            print(f"  Unit {unit['unit_number']}: {unit['unit_title']} ({len(unit['topics'])} topics)")
        
        # Step 2: Extract textbook text
        print("\n[Step 2/6] Extracting textbook text...")
        pages_data = self.textbook_extractor.extract_textbook(textbook_path)
        total_pages = self.textbook_extractor.get_total_pages(textbook_path)
        print(f"✓ Extracted text from {len(pages_data)} pages (total {total_pages} pages in PDF)")
        
        # Step 3: Chunk textbook text
        print("\n[Step 3/6] Chunking textbook text...")
        chunks = self.text_chunker.chunk_pages(pages_data, textbook_id)
        chunk_summary = self.text_chunker.get_chunk_summary(chunks)
        print(f"✓ Created {chunk_summary['total_chunks']} chunks")
        print(f"  Average words per chunk: {chunk_summary['avg_word_count']:.1f}")
        
        # Step 4: Map chunks to units
        print("\n[Step 4/6] Mapping chunks to syllabus units...")
        mapped_chunks = self.unit_mapper.map_chunks_to_units(chunks, units)
        
        # Step 5: Store in vector database
        print("\n[Step 5/6] Preparing vector store...")
        db_stats = {
            "total_vectors": 0,
            "textbook_id": textbook_id,
            "backend": settings.VECTOR_STORAGE_BACKEND,
            "faiss_cache_enabled": settings.ENABLE_FAISS_CACHE,
        }

        if settings.ENABLE_FAISS_CACHE:
            vector_db = VectorDatabase(textbook_id)
            vector_db.create_index()
            vector_db.add_chunks(mapped_chunks, only_in_syllabus=True)
            vector_db.save()
            db_stats = vector_db.get_statistics()
            db_stats["backend"] = settings.VECTOR_STORAGE_BACKEND
            db_stats["faiss_cache_enabled"] = True
        
        # Calculate statistics
        valid_chunks = [c for c in mapped_chunks if not c.get('is_out_of_syllabus', True)]
        chunks_per_unit = {}
        for chunk in valid_chunks:
            unit = chunk.get('assigned_unit_number')
            chunks_per_unit[unit] = chunks_per_unit.get(unit, 0) + 1
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        print(f"\n✓ Processing complete in {processing_time:.2f} seconds")
        
        return {
            "success": True,
            "textbook_id": textbook_id,
            "textbook_name": textbook_name,
            "total_chunks": len(chunks),
            "valid_chunks": len(valid_chunks),
            "discarded_chunks": len(chunks) - len(valid_chunks),
            "total_units": len(units),
            "units": units,
            "mapped_chunks": mapped_chunks,
            "chunks_per_unit": chunks_per_unit,
            "vector_db_stats": db_stats,
            "processing_time_seconds": processing_time
        }
