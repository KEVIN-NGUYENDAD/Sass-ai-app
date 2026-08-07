import os

from groq import Groq
from pdf_search import search_pdf

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def ai_agent(user_question):

    result = search_pdf(user_question)

    if not result:

        return """
❌ Không tìm thấy thông tin trong tài liệu.

STRICT MODE đang bật.

AI chỉ được trả lời dựa trên:

- B1_Hoa-Duoc-Biopharmaceuticals-2027.pdf
- B2_Duoc ly-Biopharmaceuticals-2026.pdf

Không sử dụng kiến thức ngoài tài liệu.
"""

    prompt = f"""
Use ONLY the information below.

Question:
{user_question}

Document Content:
{result['content']}

File:
{result['file']}

Page:
{result['page']}

Answer in Vietnamese and English.

Always include:

Source:
{result['file']}

Page:
{result['page']}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content
