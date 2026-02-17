import os
from pypdf import PdfReader, PdfWriter
from services.helpers import unique_path

def split_pdf_single(file, page_index):
    """
    Extracts a single page from a PDF file.
    Essential for engineering students extracting specific drawing sheets.
    """
    reader = PdfReader(file)
    writer = PdfWriter()
    
    # Ensure the page index is within range
    if page_index < 0 or page_index >= len(reader.pages):
        raise IndexError("Page index out of range.")
        
    # Add the specific page to the writer
    writer.add_page(reader.pages[page_index])
    
    # Generate a unique path for the output
    output_filename = f"BuiltTheory_Split_Page_{page_index + 1}.pdf"
    output_path = unique_path(output_filename)
    
    with open(output_path, "wb") as f_out:
        writer.write(f_out)
        
    return output_path
