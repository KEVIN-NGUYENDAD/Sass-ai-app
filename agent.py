import random
from pdf_search import search_pdf

def generate_quiz_pool(topic, content):
    """Create a large pool of diverse questions"""
    pool = [
        # LOẠI 1: Khái niệm
        {
            "type": "multiple_choice",
            "question_vi": f"Khái niệm '{topic}' trong dược học liên quan đến?",
            "question_en": f"What does '{topic}' in pharmaceutics relate to?",
            "options": ["A) Nội dung từ PDF", "B) Khác", "C) Không rõ", "D) Tất cả"],
            "correct": "A",
            "explanation_vi": "Dựa trên nội dung PDF",
            "explanation_en": "Based on PDF content"
        },
        {
            "type": "true_false",
            "question_vi": f"'{topic}' là khái niệm cơ bản trong ngành?",
            "question_en": f"Is '{topic}' a fundamental concept?",
            "correct": "True",
            "explanation_vi": "Đúng - Kiến thức cơ bản",
            "explanation_en": "True - Fundamental knowledge"
        },
        
        # LOẠI 2: Ứng dụng
        {
            "type": "fill_blank",
            "question_vi": f"'{topic}' giúp cải tiến _____",
            "question_en": f"'{topic}' helps improve _____",
            "correct_answer_vi": "chất lượng sản phẩm",
            "correct_answer_en": "product quality",
            "explanation_vi": "Ứng dụng thực tiễn",
            "explanation_en": "Practical application"
        },
        {
            "type": "multiple_choice",
            "question_vi": f"Ứng dụng chính của '{topic}' là gì?",
            "question_en": f"Main application of '{topic}' is?",
            "options": ["A) Phát triển dược phẩm", "B) Khác", "C) Không rõ", "D) Tất cả"],
            "correct": "A",
            "explanation_vi": "Ứng dụng phát triển",
            "explanation_en": "Development application"
        },
        
        # LOẠI 3: Tài liệu/Nội dung
        {
            "type": "true_false",
            "question_vi": f"'{topic}' được đề cập trong B1?",
            "question_en": f"Is '{topic}' mentioned in B1?",
            "correct": "True",
            "explanation_vi": "Có trong tài liệu",
            "explanation_en": "Mentioned in material"
        },
        {
            "type": "multiple_choice",
            "question_vi": f"Tài liệu nào nói về '{topic}'?",
            "question_en": f"Which document covers '{topic}'?",
            "options": ["A) B1 Hoa Duoc 2027", "B) Tiểu thuyết", "C) Báo", "D) Website"],
            "correct": "A",
            "explanation_vi": "Từ B1",
            "explanation_en": "From B1"
        },
        
        # LOẠI 4: So sánh/Phân biệt
        {
            "type": "true_false",
            "question_vi": f"'{topic}' khác với khái niệm thông thường?",
            "question_en": f"Is '{topic}' different from common concepts?",
            "correct": "True",
            "explanation_vi": "Có sự khác biệt",
            "explanation_en": "There are differences"
        },
        {
            "type": "multiple_choice",
            "question_vi": f"'{topic}' chủ yếu tập trung vào?",
            "question_en": f"'{topic}' mainly focuses on?",
            "options": ["A) Dược phẩm sinh học", "B) Hóa học", "C) Vật lý", "D) Sinh học"],
            "correct": "A",
            "explanation_vi": "Dược phẩm sinh học",
            "explanation_en": "Biopharmaceuticals"
        },
        
        # LOẠI 5: Mở rộng/Học tập thêm
        {
            "type": "true_false",
            "question_vi": f"Nên tìm hiểu sâu hơn về '{topic}'?",
            "question_en": f"Should you study '{topic}' more deeply?",
            "correct": "True",
            "explanation_vi": "Học tập liên tục",
            "explanation_en": "Continuous learning"
        },
        {
            "type": "fill_blank",
            "question_vi": f"Để thành thạo '{topic}' cần _____ kiến thức",
            "question_en": f"To master '{topic}' need _____ knowledge",
            "correct_answer_vi": "mở rộng",
            "correct_answer_en": "expand",
            "explanation_vi": "Học rộng mở",
            "explanation_en": "Broad learning"
        },
    ]
    
    return pool

def generate_quiz(topic, content):
    """Generate 5 RANDOM questions from pool"""
    pool = generate_quiz_pool(topic, content)
    
    # Shuffle pool
    random.shuffle(pool)
    
    # Pick first 5
    selected = pool[:5]
    
    return selected

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
        
        # Generate RANDOM quiz each time
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
