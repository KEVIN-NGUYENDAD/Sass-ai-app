# pdf_search.py - FIXED VERSION

from PyPDF2 import PdfReader

PDF_FILES = [
    "B1_Hoa-Duoc-Biopharmaceuticals-2027.pdf",
    "B2_Duoc_ly-Biopharmaceuticals-2026.pdf"
]

def search_pdf(query):
    """
    Search PDFs for query text
    Return: {file, page, content, found} OR {found: False, message: "NOT FOUND"}
    """
    if not query or query.strip() == "":
        return {"found": False, "message": "Empty query"}
    
    query_words = query.lower().split()
    best_result = None
    best_score = 0
    
    # Loop qua tất cả PDFs
    for pdf_file in PDF_FILES:
        try:
            reader = PdfReader(pdf_file)
            
            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                
                if not text:
                    continue
                
                text_lower = text.lower()
                
                # Tính score: bao nhiêu từ query match
                score = sum(1 for word in query_words if word in text_lower)
                
                # Nếu tìm được + score tốt hơn trước → update
                if score > best_score:
                    best_score = score
                    best_result = {
                        "found": True,
                        "file": pdf_file,
                        "page": page_number,
                        "content": text[:2000],  # First 2000 chars
                        "score": score
                    }
        
        except Exception as e:
            print(f"Error reading {pdf_file}: {e}")
            continue
    
    # IMPORTANT: Nếu không tìm → return NOT FOUND (không None!)
    if not best_result or best_score == 0:
        return {
            "found": False,
            "message": f"NOT FOUND in PDFs: '{query}'"
        }
    
    return best_result
