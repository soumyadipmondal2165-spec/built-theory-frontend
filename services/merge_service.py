import os
from pypdf import PdfWriter
from services.helpers import unique_path

def merge_pdfs(files):
    """
    Combines multiple uploaded PDF files into a single PDF.
    Supports large engineering files for PRO users.
    """
    merger = PdfWriter()
    
    # Generate a unique path for the output file
    output_filename = "BuiltTheory_Merged.pdf"
    output_path = unique_path(output_filename)

    try:
        for file in files:
            # Add each file to the merger
            merger.append(file)
            
        # Write the combined PDF to the unique path
        with open(output_path, "wb") as f_out:
            merger.write(f_out)
            
        merger.close()
        return output_path
        
    except Exception as e:
        if merger:
            merger.close()
        raise e
