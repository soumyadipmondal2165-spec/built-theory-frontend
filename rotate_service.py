import pikepdf
from services.helpers import unique_path

def rotate_pdf(file_stream, direction=90):
    # Open the PDF from the stream
    pdf = pikepdf.open(file_stream)
    angle = int(direction)
    
    # Apply rotation to every page
    for page in pdf.pages:
        page.Rotate = (page.get('/Rotate', 0) + angle) % 360
        
    outpath = unique_path(".pdf")
    pdf.save(outpath)
    pdf.close()
    return outpath