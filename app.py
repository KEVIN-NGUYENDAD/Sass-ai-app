from flask import Flask, request, render_template_string
from agent import ai_agent
from PyPDF2 import PdfReader
from docx import Document

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>💊 Huong Pharmacy AI Copilot</title>

<style>

body{
    font-family:"Segoe UI",Arial,sans-serif;
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

input[type=file]{
    margin-top:15px;
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
Drug Information • Drug Interaction • Quiz Mode • Study Mode • PDF • DOCX
</p>

<form method="POST" enctype="multipart/form-data">

<textarea
name="prompt"
placeholder="Ask a pharmacy question..."></textarea>

<br><br>

<input type="file" name="file">

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

        uploaded_file = request.files.get("file")

        document_text = ""

        if uploaded_file and uploaded_file.filename:

            filename = uploaded_file.filename.lower()

            try:

                if filename.endswith(".pdf"):

                    reader = PdfReader(uploaded_file)

                    for page in reader.pages:
                        document_text += page.extract_text() or ""

                elif filename.endswith(".docx"):

                    doc = Document(uploaded_file)

                    for paragraph in doc.paragraphs:
                        document_text += paragraph.text + "\\n"

            except Exception as e:

                document_text = f"Document Error: {e}"

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
- Pharmacy Education

Always answer in TWO languages.

FORMAT:

🇻🇳 TIẾNG VIỆT

<answer>

----------------------------

🇺🇸 ENGLISH

<answer>

IMPORTANT:

Use ONLY ONE mode at a time.

==================================================

DRUG INFORMATION MODE

Provide:

1. Drug Class
2. Mechanism of Action
3. Indications
4. Dosage
5. Side Effects
6. Monitoring
7. Counseling

==================================================

DRUG INTERACTION MODE

Provide:

1. Severity
2. Mechanism
3. Clinical Impact
4. Monitoring
5. Recommendations

==================================================

PATIENT COUNSELING MODE

Provide:

1. Purpose
2. Administration
3. Side Effects
4. Precautions
5. Monitoring

==================================================

QUIZ MODE

Generate EXACTLY the number requested.

Examples:

- Ask for 5 = generate 5.
- Ask for 10 = generate 10.

For EACH question provide:

Question

A)
B)
C)
D)

Correct Answer

Explanation

Do not stop after one question.

==================================================

STUDY MODE

Provide:

1. Key Concepts
2. Mechanism
3. Clinical Relevance
4. Exam Tips
5. Memory Tips

==================================================

DOCUMENT SUMMARY MODE

When a PDF or DOCX is uploaded:

Provide:

1. Summary
2. Key Points
3. Important Warnings
4. Clinical Relevance
5. Recommendations

==================================================

Never diagnose diseases.

Never prescribe medications.

Encourage professional healthcare consultation.
"""
            },
            {
                "role": "user",
                "content": f"""

Question:

{prompt}

Uploaded Document:

{document_text}

"""
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
