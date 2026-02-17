from convert_service import office_to_pdf

def word_to_pdf(file):
    """Converts .doc and .docx to PDF."""
    return office_to_pdf(file, "docx")

def excel_to_pdf(file):
    """Converts .xls and .xlsx to PDF."""
    return office_to_pdf(file, "xlsx")

def ppt_to_pdf(file):
    """Converts .ppt and .pptx to PDF."""
    return office_to_pdf(file, "pptx")
