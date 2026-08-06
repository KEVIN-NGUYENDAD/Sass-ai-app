import os
from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def ai_agent(messages):

    try:

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        return response.choices[0].message.content

    except Exception as e:

        return f"AI Agent Error: {str(e)}"