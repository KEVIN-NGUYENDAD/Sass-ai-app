from pdf_search import search_pdf

def generate_quiz(topic, content):
    """Auto-generate quiz questions based on topic"""
    quiz_items = [
        {
            "type": "multiple_choice",
            "question_vi": f"Câu 1: Khái niệm '{topic}' là gì?",
            "question_en": f"Q1: What is the concept of '{topic}'?",
            "options": ["A) " + content[:50] + "...", "B) Khác", "C) Không rõ", "D) Tất cả"],
            "correct": "A",
            "explanation_vi": "Dựa trên nội dung PDF đã trích dẫn",
            "explanation_en": "Based on extracted PDF content"
        },
        {
            "type": "true_false",
            "question_vi": f"Câu 2: {topic} là một khái niệm quan trọng trong dược học?",
            "question_en": f"Q2: Is '{topic}' an important concept in pharmaceutics?",
            "correct": "True",
            "explanation_vi": "Đúng - Đây là nội dung trong tài liệu dược học",
            "explanation_en": "True - This is pharmaceutical knowledge"
        },
        {
            "type": "fill_blank",
            "question_vi": f"Câu 3: _____ là một ứng dụng của {topic}",
            "question_en": f"Q3: _____ is an application of '{topic}'",
            "correct_answer_vi": "Biopharmaceutics",
            "correct_answer_en": "Biopharmaceutics",
            "explanation_vi": "Liên quan đến ứng dụng thực tế trong dược phẩm",
            "explanation_en": "Related to practical pharmaceutical applications"
        },
        {
            "type": "multiple_choice",
            "question_vi": f"Câu 4: Tài liệu nào cung cấp thông tin về {topic}?",
            "question_en": f"Q4: Which document provides information about '{topic}'?",
            "options": ["A) B1 Hoa Duoc Biopharmaceuticals 2027", "B) Tiểu sử", "C) Tiểu thuyết", "D) Báo cáo thời tiết"],
            "correct": "A",
            "explanation_vi": "Từ file B1 Hoa Duoc Biopharmaceuticals 2027",
            "explanation_en": "From B1 Hoa Duoc Biopharmaceuticals 2027"
        },
        {
            "type": "true_false",
            "question_vi": f"Câu 5: Bạn có thể tìm thêm thông tin về {topic} trong PDF?",
            "question_en": f"Q5: Can you find more information about '{topic}' in the PDF?",
            "correct": "True",
            "explanation_vi": "Có - Hãy tìm kiếm từ khóa liên quan",
            "explanation_en": "Yes - Search for related keywords"
        }
    ]
    return quiz_items

def ai_agent(user_question, include_quiz=True):
    """Bilingual agent with optional quiz generation"""
    if not user_question:
        return {
            "found": False,
            "answer_vi": "Lỗi: Câu hỏi trống!",
            "answer_en": "Error: Empty question!",
            "citation": "N/A",
            "quiz": None
        }
    
    result = search_pdf(user_question)
    
    if result.get("found"):
        file = result["file"]
        page = result["page"]
        content = result["content"]
        
        pdf_display = file.replace("_", " ").replace("-", " ").replace(".pdf", "")
        
        quiz = generate_quiz(user_question, content) if include_quiz else None
        
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
            "page": page,
            "quiz": quiz
        }
    
    else:
        return {
            "found": False,
            "question": user_question,
            "answer_vi": f"❌ Không tìm thấy: '{user_question}'",
            "answer_en": f"❌ Not found: '{user_question}'",
            "citation": "No source",
            "quiz": None
        }
