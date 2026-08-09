from pdf_search import search_pdf
from interaction_checker import check_interactions

def ai_agent(user_question):
    """
    Bilingual agent: Detailed PDF answer + short explanation + drug
    interaction warning (when the question mentions a known interacting
    pair) - Focus on comprehensive PDF content
    """
    if not user_question:
        return {
            "found": False,
            "answer_vi": "Lỗi: Câu hỏi trống!",
            "answer_en": "Error: Empty question!",
            "explanation_vi": "",
            "explanation_en": "",
            "citation": "N/A",
            "interactions": []
        }

    interactions = check_interactions(user_question)
    warning_vi = _format_interaction_warning_vi(interactions)
    warning_en = _format_interaction_warning_en(interactions)

    result = search_pdf(user_question)

    if result.get("found"):
        file = result["file"]
        page = result["page"]
        content = result["content"]

        pdf_display = file.replace("_", " ").replace("-", " ").replace(".pdf", "")

        # Generate short explanation based on content
        explanation_vi = extract_explanation_vi(content, user_question)
        explanation_en = extract_explanation_en(content, user_question)

        answer_vi = f"""📚 **TRỌ TRỢ DƯỢC HỌC**

**Câu hỏi:** {user_question}

**Trích dẫn từ PDF:**
{content}

**Giải thích ngắn:**
{explanation_vi}

**Chi tiết:**
- File: {pdf_display}
- Trang: {page}"""

        answer_en = f"""📚 **PHARMACEUTICAL ASSISTANT**

**Question:** {user_question}

**Excerpt from PDF:**
{content}

**Brief Explanation:**
{explanation_en}

**Details:**
- File: {pdf_display}
- Page: {page}"""

        if warning_vi:
            answer_vi = warning_vi + "\n\n" + answer_vi
            answer_en = warning_en + "\n\n" + answer_en

        return {
            "found": True,
            "question": user_question,
            "answer_vi": answer_vi,
            "answer_en": answer_en,
            "explanation_vi": explanation_vi,
            "explanation_en": explanation_en,
            "citation": f"{pdf_display}, Page {page}",
            "file": file,
            "page": page,
            "interactions": interactions
        }

    else:
        answer_vi = f"❌ Không tìm thấy: '{user_question}'"
        answer_en = f"❌ Not found: '{user_question}'"

        if warning_vi:
            answer_vi = warning_vi + "\n\n" + answer_vi
            answer_en = warning_en + "\n\n" + answer_en

        return {
            "found": False,
            "question": user_question,
            "answer_vi": answer_vi,
            "answer_en": answer_en,
            "explanation_vi": "Hãy thử hỏi câu hỏi khác hoặc kiểm tra từ khóa.",
            "explanation_en": "Try another question or check your keywords.",
            "citation": "No source",
            "interactions": interactions
        }


def _format_interaction_warning_vi(interactions):
    if not interactions:
        return ""

    lines = ["⚠️ **CẢNH BÁO TƯƠNG TÁC THUỐC:**"]
    for record in interactions:
        lines.append(f"- ({record['severity'].upper()}) {record['explanation_vi']}")

    return "\n".join(lines)


def _format_interaction_warning_en(interactions):
    if not interactions:
        return ""

    lines = ["⚠️ **DRUG INTERACTION WARNING:**"]
    for record in interactions:
        lines.append(f"- ({record['severity'].upper()}) {record['explanation_en']}")

    return "\n".join(lines)

def extract_explanation_vi(content, question):
    """Extract brief explanation from PDF content - Vietnamese"""
    explanations = {
        "dược": "Dược phẩm là những sản phẩm được chế tạo từ các thành phần hoạt chất, dùng để phòng ngừa, chẩn đoán hoặc điều trị bệnh tật.",
        "biopharmaceuticals": "Dược phẩm sinh học là những sản phẩm được sản xuất từ các sinh vật sống hoặc các thành phần sinh học, có cấu trúc phức tạp.",
        "biosimilar": "Dược phẩm sinh học tương tự là những phiên bản được phê duyệt pháp lý sau khi bảo hộ sáng chế hết hạn.",
        "hoạt chất": "Hoạt chất dược là thành phần chính trong dược phẩm có tác dụng chữa bệnh hoặc điều chỉnh chức năng cơ thể.",
    }
    
    for key, explanation in explanations.items():
        if key.lower() in content.lower() or key.lower() in question.lower():
            return explanation
    
    return "Nội dung PDF cung cấp thông tin chi tiết về khái niệm được hỏi. Tham khảo tài liệu đầy đủ để hiểu sâu hơn."

def extract_explanation_en(content, question):
    """Extract brief explanation from PDF content - English"""
    explanations = {
        "drug": "Pharmaceuticals are products made from active ingredients, used to prevent, diagnose or treat diseases.",
        "biopharmaceuticals": "Biopharmaceuticals are products produced from living organisms or biological components with complex structures.",
        "biosimilar": "Biosimilar drugs are legally approved subsequent versions after patent and exclusivity expiry.",
        "active": "Active pharmaceutical ingredients are the main components in medicines that have therapeutic effects.",
    }
    
    for key, explanation in explanations.items():
        if key.lower() in content.lower() or key.lower() in question.lower():
            return explanation
    
    return "The PDF content provides detailed information about the requested concept. Refer to the complete document for deeper understanding."
