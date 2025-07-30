import pdfplumber
import docx
import re
from typing import Union

# Extract PDF text
def extract_text_from_pdf(file) -> str:
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

# Extract DOCX text
def extract_text_from_docx(file) -> str:
    doc = docx.Document(file)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

# Extract first email found
def extract_email(text: str) -> Union[str, None]:
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    match = re.findall(pattern, text)
    return match[0] if match else None

# Extract text + email from file
def extract_text_and_email(file) -> dict:
    file_name = file.filename if hasattr(file, "filename") else file.name

    if file_name.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file)
    elif file_name.lower().endswith(".docx"):
        text = extract_text_from_docx(file)
    else:
        return {
            "file_name": file_name,
            "email": "Unsupported file type",
            "text": ""
        }

    email = extract_email(text)
    return {
        "file_name": file_name,
        "email": email or "Not Found",
        "text": text.strip()
    }
