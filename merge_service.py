from pypdf import PdfReader, PdfWriter
from services.helpers import unique_path

def merge_pdfs(file_streams_in_order):
    writer = PdfWriter()
    for f in file_streams_in_order:
        reader = PdfReader(f)
        for p in reader.pages:
            writer.add_page(p)
    outpath = unique_path(".pdf")
    with open(outpath, "wb") as out:
        writer.write(out)
    return outpath
