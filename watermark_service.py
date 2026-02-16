import fitz
from services.helpers import unique_path

def add_watermark(file_stream, text="Built-Theory"):
    # Open PDF using fitz
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    
    for page in doc:
        # Insert watermark at an angle (45 degrees) with light grey color
        page.insert_text(
            (50, 50), 
            text, 
            fontsize=50, 
            rotate=45, 
            color=(0.9, 0.9, 0.9)
        )
    
    outpath = unique_path(".pdf")
    doc.save(outpath)
    doc.close()
    return outpath