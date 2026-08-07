import os
from groq import Groq
from pdf_search import search_pdf

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def ai_agent(user_question):

    result = search_pdf(user_question)

    if not result:
        return "❌ Không tìm thấy thông tin trong tài liệu."

    return f"""
Nguồn:
{result['file']}

Trang:
{result['page']}

Nội dung:

{result['content'][:1000]}
"""
