from pypdf import PdfReader, PdfWriter
from services.helpers import unique_path

def split_pdf_single(file_stream, page_index=0):
    reader = PdfReader(file_stream)
    writer = PdfWriter()
    writer.add_page(reader.pages[page_index])
    outpath = unique_path(".pdf")
    with open(outpath, "wb") as f:
        writer.write(f)
    return outpath
