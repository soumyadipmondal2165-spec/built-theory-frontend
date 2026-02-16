import pikepdf
from services.helpers import unique_path

def protect_pdf(file_stream, password):
    pdf = pikepdf.Pdf.open(file_stream)
    outpath = unique_path(".pdf")
    pdf.save(outpath, encryption=pikepdf.Encryption(user=password, owner=password, R=4))
    pdf.close()
    return outpath

def unlock_pdf(file_stream, password):
    pdf = pikepdf.Pdf.open(file_stream, password=password)
    outpath = unique_path(".pdf")
    pdf.save(outpath)
    pdf.close()
    return outpath
