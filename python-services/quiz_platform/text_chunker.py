"""
Text chunking module.
Splits textbook text into semantic chunks.
"""
from typing import List, Dict
from config import settings


class TextChunker:
    """Chunks text into semantic units."""
    
    def __init__(self):
        """Initialize the chunker."""
        self.min_words = settings.CHUNK_MIN_WORDS
        self.max_words = settings.CHUNK_MAX_WORDS
        self.overlap = settings.CHUNK_OVERLAP_WORDS
    
    def chunk_pages(self, pages_data: List[Dict], textbook_id: str) -> List[Dict[str, any]]:
        """
        Chunk page data into semantic units.
        
        Args:
            pages_data: List of page dictionaries with text
            textbook_id: Identifier for the textbook
            
        Returns:
            List of chunk dictionaries
        """
        chunks = []
        chunk_counter = 0
        
        for page in pages_data:
            page_number = page["page_number"]
            text = page["text"]
            
            # Split page into paragraphs
            paragraphs = text.split('\n\n')
            
            # Create chunks from paragraphs
            current_chunk = ""
            word_count = 0
            
            for para in paragraphs:
                para_words = len(para.split())
                
                if word_count + para_words <= self.max_words:
                    # Add paragraph to current chunk
                    if current_chunk:
                        current_chunk += "\n\n"
                    current_chunk += para
                    word_count += para_words
                else:
                    # Save current chunk if it meets minimum
                    if word_count >= self.min_words:
                        chunks.append(self._create_chunk(
                            chunk_counter, textbook_id, current_chunk, page_number
                        ))
                        chunk_counter += 1
                    
                    # Start new chunk with overlap
                    current_chunk = para
                    word_count = para_words
            
            # Save remaining chunk
            if word_count >= self.min_words:
                chunks.append(self._create_chunk(
                    chunk_counter, textbook_id, current_chunk, page_number
                ))
                chunk_counter += 1
        
        return chunks
    
    def _create_chunk(self, index: int, textbook_id: str, text: str, page_number: int) -> Dict[str, any]:
        """Create a chunk dictionary."""
        words = text.split()
        return {
            "chunk_id": f"{textbook_id}_chunk_{index}",
            "textbook_id": textbook_id,
            "chunk_index": index,
            "text": text,
            "word_count": len(words),
            "page_number": page_number,
            "char_count": len(text)
        }
    
    def get_chunk_summary(self, chunks: List[Dict]) -> Dict[str, any]:
        """Get summary statistics about chunks."""
        if not chunks:
            return {
                "total_chunks": 0,
                "avg_word_count": 0,
                "min_word_count": 0,
                "max_word_count": 0
            }
        
        word_counts = [c.get("word_count", 0) for c in chunks]
        return {
            "total_chunks": len(chunks),
            "avg_word_count": sum(word_counts) / len(chunks),
            "min_word_count": min(word_counts),
            "max_word_count": max(word_counts)
        }
