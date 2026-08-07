from pdf_search import search_pdf

def ai_agent(user_question):
    """
    Bilingual agent: VN + EN, with PDF citation
    """
    if not user_question:
        return {
            "found": False,
            "answer_vi": "Lỗi: Câu hỏi trống!",
            "answer_en": "Error: Empty question!",
            "citation": "N/A"
        }
    
    result = search_pdf(user_question)
    
    if result.get("found"):
        file = result["file"]
        page = result["page"]
        content = result["content"]
        score = result.get("score", 0)
        
        pdf_display = file.replace("_", " ").replace("-", " ").replace(".pdf", "")
        
        return {
            "found": True,
            "question": user_question,
            "answer_vi": f"""📚 **TRỌ TRỢ DƯỢC HỌC**

**Câu hỏi:** {user_question}

**Nội dung từ PDF:**
{content}...

**Chi tiết:**
- File: {pdf_display}
- Trang: {page}""",
            
            "answer_en": f"""📚 **PHARMACEUTICAL ASSISTANT**

**Question:** {user_question}

**Content from PDF:**
{content}...

**Details:**
- File: {pdf_display}
- Page: {page}""",
            
            "citation": f"{pdf_display}, Page {page}",
            "file": file,
            "page": page
        }
    
    else:
        return {
            "found": False,
            "question": user_question,
            "answer_vi": f"❌ Không tìm thấy: '{user_question}'",
            "answer_en": f"❌ Not found: '{user_question}'",
            "citation": "No source"
        }
