import pytesseract
from PIL import Image
import fitz
from services.helpers import unique_path

def ocr_pdf(file_stream):
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    out_txt = []
    for page in doc:
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        txt = pytesseract.image_to_string(img)
        out_txt.append(txt)
    doc.close()
    path = unique_path(".txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(out_txt))
    return path
