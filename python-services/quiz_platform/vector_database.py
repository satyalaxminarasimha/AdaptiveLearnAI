"""
Vector database module.
Manages FAISS vector database for storing chunk embeddings.
"""
import faiss
import numpy as np
import pickle
import os
from typing import List, Dict, Optional
from config import settings
from unit_mapper import UnitMapper


class VectorDatabase:
    """Manages FAISS vector database for textbook chunks."""
    
    def __init__(self, textbook_id: str):
        """
        Initialize vector database for a specific textbook.
        
        Args:
            textbook_id: Unique identifier for the textbook
        """
        self.textbook_id = textbook_id
        self.dimension = settings.EMBEDDING_DIMENSION
        self.index_path = os.path.join(
            settings.FAISS_INDEX_PATH,
            f"{textbook_id}.index"
        )
        self.metadata_path = os.path.join(
            settings.FAISS_INDEX_PATH,
            f"{textbook_id}_metadata.pkl"
        )
        
        os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
        
        self.index = None
        self.metadata = []
        self.mapper = UnitMapper()
    
    def create_index(self):
        """Create a new FAISS index."""
        self.index = faiss.IndexFlatL2(self.dimension)
        print(f"Created FAISS index with dimension {self.dimension}")
    
    def add_chunks(
        self,
        chunks: List[Dict[str, any]],
        only_in_syllabus: bool = True
    ):
        """Add chunks to the vector database."""
        if self.index is None:
            self.create_index()
        
        if only_in_syllabus:
            valid_chunks = [
                c for c in chunks
                if not c.get('is_out_of_syllabus', True)
            ]
        else:
            valid_chunks = chunks
        
        if not valid_chunks:
            print("No valid chunks to add to vector database.")
            return
        
        print(f"Adding {len(valid_chunks)} chunks to vector database...")
        
        chunk_texts = [chunk['text'] for chunk in valid_chunks]
        embeddings = self.mapper.get_embeddings_batch(chunk_texts)
        
        self.index.add(embeddings.astype('float32'))
        
        for i, chunk in enumerate(valid_chunks):
            metadata = {
                'chunk_id': chunk['chunk_id'],
                'textbook_id': chunk['textbook_id'],
                'unit_number': chunk.get('assigned_unit_number'),
                'page_number': chunk.get('page_number'),
                'chunk_index': chunk.get('chunk_index'),
                'text': chunk['text'],
                'word_count': chunk.get('word_count'),
                'similarity_score': chunk.get('similarity_score'),
                'vector_index': len(self.metadata) + i
            }
            self.metadata.append(metadata)
        
        print(f"Successfully added {len(valid_chunks)} chunks")
        print(f"Total vectors in index: {self.index.ntotal}")
    
    def save(self):
        """Save FAISS index and metadata to disk."""
        if self.index is None:
            print("No index to save.")
            return
        
        faiss.write_index(self.index, self.index_path)
        print(f"Saved FAISS index to {self.index_path}")
        
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f)
        print(f"Saved metadata to {self.metadata_path}")
    
    def load(self):
        """Load FAISS index and metadata from disk."""
        if not os.path.exists(self.index_path):
            print(f"Index file not found: {self.index_path}")
            return False
        
        self.index = faiss.read_index(self.index_path)
        print(f"Loaded FAISS index from {self.index_path}")
        print(f"Total vectors: {self.index.ntotal}")
        
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'rb') as f:
                self.metadata = pickle.load(f)
            print(f"Loaded {len(self.metadata)} metadata entries")
        
        return True
    
    def search(
        self,
        query_text: str,
        k: int = 5,
        unit_filter: Optional[int] = None
    ) -> List[Dict[str, any]]:
        """Search for similar chunks."""
        if self.index is None or self.index.ntotal == 0:
            return []
        
        query_embedding = self.mapper.get_embeddings(query_text)
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        
        distances, indices = self.index.search(query_embedding, min(k, self.index.ntotal))
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.metadata):
                result = self.metadata[idx].copy()
                result['distance'] = float(distances[0][i])
                result['similarity'] = 1 / (1 + distances[0][i])
                
                if unit_filter is None or result.get('unit_number') == unit_filter:
                    results.append(result)
        
        return results[:k]
    
    def get_statistics(self) -> Dict[str, any]:
        """Get statistics about the vector database."""
        if not self.metadata:
            return {
                "total_vectors": 0,
                "textbook_id": self.textbook_id
            }
        
        unit_distribution = {}
        for meta in self.metadata:
            unit = meta.get('unit_number')
            unit_distribution[unit] = unit_distribution.get(unit, 0) + 1
        
        return {
            "total_vectors": len(self.metadata),
            "textbook_id": self.textbook_id,
            "unit_distribution": unit_distribution,
            "index_size_bytes": os.path.getsize(self.index_path) if os.path.exists(self.index_path) else 0
        }
