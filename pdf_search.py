from PyPDF2 import PdfReader

PDF_FILES = [
    "B1_Hoa-Duoc-Biopharmaceuticals-2027.pdf",
    "B2_Duoc ly-Biopharmaceuticals-2026.pdf"
]

def search_pdf(query):

    query_words = query.lower().split()

    best_result = None
    best_score = 0

    for pdf_file in PDF_FILES:

        try:

            reader = PdfReader(pdf_file)

            for page_number, page in enumerate(reader.pages, start=1):

                text = page.extract_text()

                if not text:
                    continue

                text_lower = text.lower()

                score = 0

                for word in query_words:

                    if word in text_lower:
                        score += 1

                if score > best_score:

                    best_score = score

                    best_result = {
                        "file": pdf_file,
                        "page": page_number,
                        "content": text[:4000]
                    }

        except Exception as e:
            print(e)

    return best_result