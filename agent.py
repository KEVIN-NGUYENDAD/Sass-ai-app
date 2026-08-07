# agent.py - improved

from pdf_search import search_pdf
import textwrap


def ai_agent(user_question):
    """
    Query agent: search PDFs + return answer with citation
    Returns a plain text response describing the match or a not-found message.
    """
    if not user_question or not str(user_question).strip():
        return "Error: Empty question"

    try:
        result = search_pdf(user_question)
    except Exception as e:
        return f"Error: Exception while searching PDFs: {e}"

    if not isinstance(result, dict):
        return "Error: invalid result from search_pdf"

    if result.get("found"):
        # Found in PDF
        file = result.get("file", "Unknown")
        page = result.get("page", "Unknown")
        content = result.get("content", "") or ""
        snippet = content[:500]

        return textwrap.dedent(f"""\
        ANSWER FOUND:
        File: {file}
        Page: {page}
        Content: {snippet}...

        Citation: {file} - Page {page}
        """)
    else:
        # NOT FOUND
        message = result.get("message", "NOT FOUND")
        return textwrap.dedent(f"""\
        {message}

        Question: {user_question}
        Status: No relevant information in knowledge base
        """)
