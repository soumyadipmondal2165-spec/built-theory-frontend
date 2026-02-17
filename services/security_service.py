import pikepdf
from services.helpers import unique_path

def protect_pdf(file, password):
    """Encrypts a PDF with a password for PRO users."""
    with pikepdf.open(file) as pdf:
        output_path = unique_path("BuiltTheory_Protected.pdf")
        # Set encryption permissions
        permissions = pikepdf.Permissions(extract=False, print_lowres=True)
        pdf.save(output_path, encryption=pikepdf.Encryption(owner=password, user=password, allow=permissions))
    return output_path

def unlock_pdf(file, password):
    """Removes password protection from a PDF."""
    try:
        with pikepdf.open(file, password=password) as pdf:
            output_path = unique_path("BuiltTheory_Unlocked.pdf")
            pdf.save(output_path)
        return output_path
    except pikepdf.PasswordError:
        raise Exception("Incorrect password provided.")
