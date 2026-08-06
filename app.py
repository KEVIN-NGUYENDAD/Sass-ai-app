from flask import Flask, request
from agent import ai_agent

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():

    response = ""

    if request.method == "POST":

        prompt = request.form.get("prompt", "")

        messages = [
            {
                "role": "system",
                "content": """
You are Huong Pharmacy AI Copilot.

Always answer in Vietnamese and English.

Never diagnose diseases.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        response = ai_agent(messages)

    return f"""
    <html>
    <head>
    <title>Huong Pharmacy AI Copilot</title>
    </head>
    <body>

    <h1>💊 Huong Pharmacy AI Copilot</h1>

    <form method="POST">
        <textarea name="prompt" rows="8" cols="80"></textarea>
        <br><br>
        <button type="submit">Ask AI</button>
    </form>

    <pre>{response}</pre>

    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
