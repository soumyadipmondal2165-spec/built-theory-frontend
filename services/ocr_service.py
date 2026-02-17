import pytesseract
from pdf2image import convert_from_path
from services.helpers import unique_path
import os

def ocr_pdf(file):
    """Converts scanned PDFs into searchable text documents."""
    temp_pdf = unique_path("temp_ocr.pdf")
    with open(temp_pdf, "wb") as f:
        f.write(file.read())
        
    pages = convert_from_path(temp_pdf, 300)
    output_text_path = unique_path("BuiltTheory_OCR_Result.txt")
    
    with open(output_text_path, "w") as f:
        for page in pages:
            text = pytesseract.image_to_string(page)
            f.write(text)
            
    return output_text_path
