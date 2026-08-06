from flask import Flask, request, render_template_string
from agent import ai_agent

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>💊 Huong Pharmacy AI Copilot</title>

<style>

body{
    font-family: "Segoe UI", Arial, sans-serif;
    background:#f4f7f9;
    margin:0;
}

.container{
    width:85%;
    margin:auto;
    padding:20px;
}

h1{
    color:#0f766e;
}

textarea{
    width:100%;
    height:180px;
    padding:15px;
    border-radius:10px;
    border:1px solid #ccc;
    font-size:16px;
}

button{
    background:#0f766e;
    color:white;
    border:none;
    padding:12px 20px;
    border-radius:8px;
    cursor:pointer;
}

.user{
    background:white;
    margin-top:20px;
    padding:15px;
    border-radius:10px;
}

.ai{
    background:#ecfeff;
    margin-top:20px;
    padding:15px;
    border-radius:10px;
}

.response{
    white-space:pre-wrap;
    line-height:1.8;
}

.warning{
    margin-top:20px;
    background:#fef3c7;
    padding:10px;
    border-radius:8px;
}

</style>
</head>

<body>

<div class="container">

<h1>💊 Huong Pharmacy AI Copilot</h1>

<p>
Drug Information • Drug Interaction • Quiz Mode
</p>

<form method="POST">

<textarea
name="prompt"
placeholder="Ask a pharmacy question..."></textarea>

<br><br>

<button type="submit">
Ask AI
</button>

</form>

{% if prompt %}
<div class="user">
<h3>Question</h3>
<div>{{ prompt }}</div>
</div>
{% endif %}

{% if response %}
<div class="ai">
<h3>💊 Huong AI Response</h3>
<div class="response">{{ response }}</div>
</div>
{% endif %}

<div class="warning">
⚠ Educational Use Only. This AI does not replace doctors or pharmacists.
</div>

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
You are Huong Pharmacy AI Copilot.

You are an expert in:

- Clinical Pharmacy
- Pharmacology
- Drug Information
- Drug Interactions
- Medication Safety
- Patient Counseling

Always answer in TWO languages.

FORMAT:

🇻🇳 TIẾNG VIỆT

<answer>

----------------------------

🇺🇸 ENGLISH

<answer>

Only use ONE mode at a time.

DRUG INFORMATION MODE:
- Drug Class
- Mechanism of Action
- Indications
- Side Effects
- Monitoring
- Counseling

DRUG INTERACTION MODE:
- Severity
- Mechanism
- Clinical Impact
- Monitoring
- Recommendations

QUIZ MODE:
- Question
- A B C D
- Correct Answer
- Explanation

PATIENT COUNSELING MODE:
- Purpose
- Administration
- Side Effects
- Precautions
- Monitoring

Never diagnose diseases.

Never prescribe medications.

Encourage professional healthcare consultation.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        response = ai_agent(messages)

    return render_template_string(
        HTML,
        prompt=prompt,
        response=response
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
