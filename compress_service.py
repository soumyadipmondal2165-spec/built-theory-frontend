import fitz  # pymupdf
from services.helpers import unique_path

def compress_pdf(file_stream, deflate=True, garbage=4):
    # file_stream should be file-like object (werkzeug FileStorage)
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    outpath = unique_path(".pdf")
    # save with recompression options
    doc.save(outpath, garbage=garbage, deflate=deflate)
    doc.close()
    return outpath
