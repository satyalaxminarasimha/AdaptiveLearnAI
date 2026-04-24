"""
Syllabus extraction module.
Extracts units and topics from syllabus PDFs.
"""
import pdfplumber
import re
from typing import List, Dict


class SyllabusExtractor:
    """Extracts units and topics from syllabus PDFs."""
    
    def __init__(self):
        """Initialize the extractor."""
        pass
    
    def extract_syllabus(self, pdf_path: str) -> List[Dict[str, any]]:
        """
        Extract syllabus units and topics from PDF.
        
        Args:
            pdf_path: Path to syllabus PDF
            
        Returns:
            List of unit dictionaries with topics
        """
        units = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Extract all text
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                # Parse units and topics
                units = self._parse_units_from_text(full_text)
                
                if not units:
                    # If parsing fails, create default units
                    units = self._create_default_units()
        except Exception as e:
            print(f"Error extracting syllabus: {str(e)}")
            units = self._create_default_units()
        
        return units
    
    def _parse_units_from_text(self, text: str) -> List[Dict[str, any]]:
        """
        Parse units and topics from extracted text.
        
        Args:
            text: Full extracted text from syllabus
            
        Returns:
            List of parsed units
        """
        units = []
        
        # Look for unit patterns: "Unit 1:", "Unit 1 -", etc.
        unit_pattern = r'(?:UNIT|Unit)\s+([0-9]+)[:\s\-]*(.+?)(?=(?:UNIT|Unit)\s+[0-9]+|$)'
        matches = re.finditer(unit_pattern, text, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            unit_num = int(match.group(1))
            unit_content = match.group(2)
            
            # Extract topics (lines that don't start with numbers or special chars)
            lines = unit_content.split('\n')
            title = lines[0].strip() if lines else f"Unit {unit_num}"
            
            topics = []
            for line in lines[1:]:
                line = line.strip()
                if line and not re.match(r'^[0-9\s\-\*•]+', line):
                    topics.append(line)
            
            units.append({
                "unit_number": unit_num,
                "unit_title": title[:100],  # Limit length
                "topics": topics[:10]  # Limit number of topics
            })
        
        return units
    
    def _create_default_units(self) -> List[Dict[str, any]]:
        """Create default units if parsing fails."""
        return [
            {
                "unit_number": i,
                "unit_title": f"Unit {i}",
                "topics": ["Topic 1", "Topic 2", "Topic 3"]
            }
            for i in range(1, 6)
        ]
