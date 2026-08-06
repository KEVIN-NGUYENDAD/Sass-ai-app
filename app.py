from flask import Flask, request, render_template_string
from agent import ai_agent

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>💊 Hương Pharmacy AI Copilot</title>

<style>

body{
    background:#f4f7f9;
    font-family:"Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.container{
    width:85%;
    margin:auto;
    padding:20px;
}

h1{
    color:#0f766e;
    font-size:52px;
}

.subtitle{
    font-size:24px;
    margin-bottom:20px;
}

textarea{
    width:100%;
    height:180px;
    padding:15px;
    border-radius:10px;
    border:1px solid #ccc;
    font-size:18px;
}

button{
    padding:12px 28px;
    background:#0f766e;
    color:white;
    border:none;
    border-radius:10px;
    cursor:pointer;
    font-size:18px;
}

button:hover{
    background:#115e59;
}

.user{
    background:white;
    padding:20px;
    margin-top:25px;
    border-radius:12px;
    border:1px solid #ddd;
}

.ai{
    background:#ecfeff;
    padding:25px;
    margin-top:25px;
    border-radius:12px;
    border:1px solid #a5f3fc;
}

.question{
    font-size:20px;
    line-height:1.8;
}

.response{
    white-space:pre-wrap;
    font-size:19px;
    line-height:1.9;
}

.vn{
    color:#0f766e;
    font-weight:bold;
    font-size:22px;
}

.en{
    color:#2563eb;
    font-weight:bold;
    font-size:22px;
}

</style>
</head>

<body>

<div class="container">

<h1>💊 Hương Pharmacy AI Copilot</h1>

<p class="subtitle">
AI-powered Pharmacy Assistant
</p>

<form method="POST">

<textarea
name="prompt"
placeholder="Ask a pharmacy question...">
</textarea>

<br><br>

<button type="submit">
Ask AI
</button>

</form>

{% if prompt %}

<div class="user">

<h2>Question</h2>

<div class="question">
{{ prompt }}
</div>

</div>

{% endif %}

{% if response %}

<div class="ai">

<h2>💊 Hương AI Response</h2>

<div class="response">
{{ response | safe }}
</div>

</div>

{% endif %}

</div>

</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def home():

    prompt = ""
    response = ""

    if request.method == "POST":

        prompt = request.form.get("prompt", "")

        messages = [
            {
                "role": "system",
                "content": """
You are Hương Pharmacy AI Copilot.

You are an expert in:

- Clinical Pharmacy
- Pharmacology
- Drug Information
- Drug Interactions
- Medication Safety
- Patient Counseling
- Patient Education

Always answer in BOTH Vietnamese and English.

Use exactly this format:

🇻🇳 TIẾNG VIỆT

<answer>

🇺🇸 ENGLISH

<answer>

Never diagnose diseases.

Never replace professional healthcare providers.

Always encourage consultation with licensed pharmacists or physicians when appropriate.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        response = ai_agent(messages)

        response = response.replace(
            "🇻🇳 TIẾNG VIỆT",
            '<div class="vn">🇻🇳 TIẾNG VIỆT</div>'
        )

        response = response.replace(
            "🇺🇸 ENGLISH",
            '<div class="en">🇺🇸 ENGLISH</div>'
        )

    return render_template_string(
        HTML,
        prompt=prompt,
        response=response
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)