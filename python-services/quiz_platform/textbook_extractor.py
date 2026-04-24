"""
PDF text extraction module.
Extracts text from PDF files with page-level granularity.
"""
import pdfplumber
from typing import List, Dict, Optional


class TextbookExtractor:
    """Extracts text from textbook PDFs."""
    
    def __init__(self):
        """Initialize the extractor."""
        self.total_pages = 0
    
    def extract_textbook(self, pdf_path: str) -> List[Dict[str, any]]:
        """
        Extract text from textbook PDF.
        
        Args:
            pdf_path: Path to textbook PDF
            
        Returns:
            List of page dictionaries with extracted text
        """
        pages_data = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                self.total_pages = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        text = page.extract_text()
                        if text and text.strip():
                            pages_data.append({
                                "page_number": page_num,
                                "text": text.strip(),
                                "char_count": len(text)
                            })
                    except Exception as e:
                        print(f"Error extracting page {page_num}: {str(e)}")
                        continue
        except Exception as e:
            print(f"Error opening PDF {pdf_path}: {str(e)}")
            raise
        
        return pages_data
    
    def get_total_pages(self, pdf_path: str) -> int:
        """Get total number of pages in PDF."""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                return len(pdf.pages)
        except Exception as e:
            print(f"Error getting page count: {str(e)}")
            return 0
