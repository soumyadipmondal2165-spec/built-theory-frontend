import os
import pikepdf
from services.helpers import unique_path

def compress_pdf(file):
    """
    Reduces PDF file size by optimizing internal objects.
    Crucial for students submitting large engineering reports to portals.
    """
    try:
        # Load the PDF using pikepdf for optimization
        with pikepdf.open(file) as pdf:
            # Generate a unique path for the compressed result
            output_filename = "BuiltTheory_Compressed.pdf"
            output_path = unique_path(output_filename)
            
            # Save with settings that optimize and compress
            pdf.save(output_path, linearize=True, keep_overwriting_pdf=False)
            
        return output_path
        
    except Exception as e:
        raise Exception(f"Compression failed: {str(e)}")
