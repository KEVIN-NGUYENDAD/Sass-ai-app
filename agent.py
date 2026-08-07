# agent.py - FIXED VERSION

from pdf_search import search_pdf

def ai_agent(user_question):
    """
    Query agent: search PDFs + return answer with citation
    """
    if not user_question:
        return "Error: Empty question"
    
    # ✅ CALL pdf_search (LỖIJCŨ)
    result = search_pdf(user_question)
    
    # Xử lý result
    if result.get("found"):
        # Found in PDF
        file = result["file"]
        page = result["page"]
        content = result["content"]
        
        return f"""
ANSWER FOUND:
File: {file}
Page: {page}
Content: {content[:500]}...

Citation: {file} - Page {page}
"""
    else:
        # NOT FOUND
        message = result.get("message", "NOT FOUND")
        return f"""
{message}

Question: {user_question}
Status: No relevant information in knowledge base
"""
