"""
Unit mapping module.
Maps text chunks to syllabus units using semantic similarity.
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
from config import settings


class UnitMapper:
    """Maps text chunks to syllabus units using semantic embeddings."""
    
    def __init__(self, model_name: str = None):
        """
        Initialize the unit mapper with embedding model.
        
        Args:
            model_name: Name of sentence-transformers model
        """
        self.model_name = model_name or settings.EMBEDDING_MODEL
        print(f"Loading embedding model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        self.threshold = settings.SIMILARITY_THRESHOLD
        print(f"Similarity threshold: {self.threshold}")
    
    def map_chunks_to_units(
        self,
        chunks: List[Dict[str, any]],
        units: List[Dict[str, any]]
    ) -> List[Dict[str, any]]:
        """
        Map each chunk to the most similar syllabus unit.
        
        Args:
            chunks: List of chunk dictionaries from TextChunker
            units: List of unit dictionaries from SyllabusExtractor
            
        Returns:
            List of chunks with mapping information
        """
        if not chunks or not units:
            return chunks
        
        print(f"Mapping {len(chunks)} chunks to {len(units)} units...")
        
        # Create unit embeddings
        unit_texts = []
        unit_numbers = []
        
        for unit in units:
            unit_text = self._create_unit_text(unit)
            unit_texts.append(unit_text)
            unit_numbers.append(unit['unit_number'])
        
        print("Generating unit embeddings...")
        unit_embeddings = self.model.encode(unit_texts, show_progress_bar=True)
        
        print("Generating chunk embeddings...")
        chunk_texts = [chunk['text'] for chunk in chunks]
        chunk_embeddings = self.model.encode(chunk_texts, show_progress_bar=True)
        
        # Map each chunk to best matching unit
        print("Computing similarities and assigning units...")
        mapped_chunks = []
        
        for i, chunk in enumerate(chunks):
            chunk_embedding = chunk_embeddings[i].reshape(1, -1)
            similarities = cosine_similarity(chunk_embedding, unit_embeddings)[0]
            
            best_unit_idx = np.argmax(similarities)
            best_similarity = similarities[best_unit_idx]
            
            if best_similarity >= self.threshold:
                assigned_unit = unit_numbers[best_unit_idx]
                is_out_of_syllabus = False
            else:
                assigned_unit = None
                is_out_of_syllabus = True
            
            mapped_chunk = chunk.copy()
            mapped_chunk['assigned_unit_number'] = assigned_unit
            mapped_chunk['similarity_score'] = float(best_similarity)
            mapped_chunk['is_out_of_syllabus'] = is_out_of_syllabus
            mapped_chunks.append(mapped_chunk)
        
        return mapped_chunks
    
    def _create_unit_text(self, unit: Dict) -> str:
        """Create text representation of a unit."""
        title = unit.get('unit_title', f"Unit {unit.get('unit_number')}")
        topics = unit.get('topics', [])
        
        if isinstance(topics, list):
            topics_text = " ".join(topics)
        else:
            topics_text = str(topics)
        
        return f"{title}. Topics: {topics_text}"
    
    def get_embeddings(self, text: str) -> np.ndarray:
        """Get embedding for a single text."""
        return self.model.encode([text])[0]
    
    def get_embeddings_batch(self, texts: List[str]) -> np.ndarray:
        """Get embeddings for multiple texts."""
        return self.model.encode(texts, show_progress_bar=False)
