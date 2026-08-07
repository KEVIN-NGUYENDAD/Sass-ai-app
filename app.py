from flask import Flask, request, jsonify
from agent import ai_agent
import os

app = Flask(__name__, static_folder='.', template_folder='.')

HTML_CHATBOX = '''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trợ Lý Dược Học - Pharmaceutical Assistant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
        }
        .container {
            width: 100%;
            max-width: 900px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            height: 95vh;
            max-height: 900px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px 15px 0 0;
            text-align: center;
        }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        .chat-box {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .message {
            margin-bottom: 15px;
            animation: slideIn 0.3s ease-in;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .user-message { display: flex; justify-content: flex-end; }
        .user-message .content {
            background: #667eea;
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 70%;
            word-wrap: break-word;
        }
        .bot-message { display: flex; justify-content: flex-start; }
        .bot-message .content {
            background: white;
            color: #333;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 85%;
            border-left: 4px solid #667eea;
        }
        .language-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        .tab-button {
            background: none;
            border: none;
            padding: 8px 12px;
            cursor: pointer;
            font-weight: bold;
            color: #999;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }
        .tab-button.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .citation {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #ddd;
            font-style: italic;
        }
        .quiz-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #667eea;
            background: #f0f4ff;
            border-radius: 8px;
            padding: 12px;
        }
        .quiz-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .quiz-item {
            margin-bottom: 12px;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border-left: 3px solid #667eea;
        }
        .quiz-question-box {
            font-weight: bold;
            margin-bottom: 10px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
            min-height: 40px;
            display: block !important;
            font-size: 13px;
            line-height: 1.4;
        }
        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .quiz-option {
            padding: 8px 12px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 12px;
            text-align: center;
        }
        .quiz-option:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        .quiz-answer {
            margin-top: 10px;
            padding: 10px;
            background: #e8f5e9;
            border-left: 3px solid #4caf50;
            border-radius: 4px;
            font-size: 12px;
            color: #2e7d32;
            display: none;
            line-height: 1.5;
        }
        .quiz-answer.show {
            display: block;
        }
        .not-found { background: #fff3cd; border-left-color: #ff9800; }
        .input-area {
            padding: 20px;
            background: white;
            border-radius: 0 0 15px 15px;
            border-top: 1px solid #e0e0e0;
        }
        .input-wrapper {
            display: flex;
            gap: 10px;
        }
        .input-wrapper input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        .input-wrapper input:focus {
            outline: none;
            border-color: #667eea;
        }
        .input-wrapper button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
        }
        .input-wrapper button:hover { background: #764ba2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Trợ Lý Dược Học</h1>
            <p>Pharmaceutical Assistant | Song ngữ Việt-Anh + Quiz Ôn Tập</p>
        </div>
        <div class="chat-box" id="chatBox"></div>
        <div class="input-area">
            <div class="input-wrapper">
                <input type="text" id="questionInput" placeholder="Hỏi về dược phẩm... / Ask about pharmaceuticals..." onkeypress="handleKeyPress(event)">
                <button onclick="sendQuestion()">📤 Gửi / Send</button>
            </div>
        </div>
    </div>
    <script>
        const chatBox = document.getElementById('chatBox');
        const questionInput = document.getElementById('questionInput');
        
        function sendQuestion() {
            const question = questionInput.value.trim();
            if (!question) return;
            addMessage(question, 'user');
            questionInput.value = '';
            
            fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({question: question})
            })
            .then(r => r.json())
            .then(data => addMessage(data, 'bot'))
            .catch(e => {
                console.error(e);
                addMessage({found: false, answer_vi: 'Lỗi kết nối', answer_en: 'Connection error', citation: 'N/A'}, 'bot');
            });
        }
        
        function addMessage(content, type) {
            const div = document.createElement('div');
            div.className = `message ${type}-message`;
            
            if (type === 'user') {
                div.innerHTML = `<div class="content">${escapeHtml(content)}</div>`;
            } else {
                let html = `<div class="content ${content.found ? '' : 'not-found'}">`;
                
                if (content.found) {
                    html += `
                        <div class="language-tabs">
                            <button class="tab-button active" onclick="switchTab(this, 'vi')">🇻🇳 Tiếng Việt</button>
                            <button class="tab-button" onclick="switchTab(this, 'en')">🇬🇧 English</button>
                        </div>
                        <div class="tab-content active" id="vi">${content.answer_vi.replace(/\\n/g, '<br>')}</div>
                        <div class="tab-content" id="en">${content.answer_en.replace(/\\n/g, '<br>')}</div>
                        <div class="citation">📍 ${content.citation}</div>
                    `;
                    
                    if (content.quiz && content.quiz.length > 0) {
                        html += `<div class="quiz-section"><div class="quiz-title">📝 QUIZ ÔN TẬP / PRACTICE QUIZ</div>`;
                        
                        content.quiz.forEach((q, idx) => {
                            const qId = 'q' + idx;
                            html += `<div class="quiz-item">`;
                            
                            // QUESTION BOX - FIX FOR Q1-Q5
                            html += `<div class="quiz-question-box">
                                <div class="language-tabs" style="margin-bottom: 8px;">
                                    <button class="tab-button active" onclick="switchQuizTab(this, '${qId}_vi')">🇻🇳 VN</button>
                                    <button class="tab-button" onclick="switchQuizTab(this, '${qId}_en')">🇬🇧 EN</button>
                                </div>
                                <div class="tab-content active" id="${qId}_vi">${q.question_vi}</div>
                                <div class="tab-content" id="${qId}_en">${q.question_en}</div>
                            </div>`;
                            
                            // OPTIONS
                            if (q.type === 'multiple_choice') {
                                html += `<div class="quiz-options">`;
                                q.options.forEach(opt => {
                                    html += `<button class="quiz-option" onclick="checkAnswer(this, '${q.correct}', '${qId}')">${opt}</button>`;
                                });
                                html += `</div>`;
                            } else if (q.type === 'true_false') {
                                html += `<div class="quiz-options">
                                    <button class="quiz-option" onclick="checkAnswer(this, 'True', '${qId}')">True / Đúng</button>
                                    <button class="quiz-option" onclick="checkAnswer(this, 'False', '${qId}')">False / Sai</button>
                                </div>`;
                            }
                            
                            // ANSWER BOX
                            html += `<div class="quiz-answer" id="${qId}_answer">
                                <strong>✅ Đáp án / Answer:</strong> ${q.correct || q.correct_answer_vi}<br>
                                <strong>📖 Giải thích / Explanation:</strong> ${q.explanation_vi} / ${q.explanation_en}
                            </div></div>`;
                        });
                        
                        html += `</div>`;
                    }
                } else {
                    html += `
                        <div class="language-tabs">
                            <button class="tab-button active" onclick="switchTab(this, 'vi')">🇻🇳 Tiếng Việt</button>
                            <button class="tab-button" onclick="switchTab(this, 'en')">🇬🇧 English</button>
                        </div>
                        <div class="tab-content active" id="vi">${content.answer_vi.replace(/\\n/g, '<br>')}</div>
                        <div class="tab-content" id="en">${content.answer_en.replace(/\\n/g, '<br>')}</div>
                    `;
                }
                
                html += `</div>`;
                div.innerHTML = html;
            }
            
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        
        function switchTab(button, lang) {
            button.parentElement.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            button.parentElement.parentElement.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            button.parentElement.parentElement.querySelector('#' + lang).classList.add('active');
        }
        
        function switchQuizTab(button, lang) {
            const parent = button.closest('.quiz-question-box');
            parent.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            parent.querySelector('#' + lang).classList.add('active');
        }
        
        function checkAnswer(element, correct, qId) {
            const answer = document.getElementById(qId + '_answer');
            answer.classList.add('show');
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') sendQuestion();
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        window.addEventListener('load', () => {
            addMessage({
                found: false,
                answer_vi: '👋 Xin chào! Tôi là Trợ Lý Dược Học với Quiz Ôn Tập. Hãy hỏi bất kỳ câu hỏi nào!',
                answer_en: '👋 Hello! I am Pharmaceutical Assistant with Practice Quiz. Ask me anything!',
                citation: 'System'
            }, 'bot');
        });
    </script>
</body>
</html>'''

@app.route('/', methods=['GET'])
def chatbox():
    return HTML_CHATBOX

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.json
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({
            'found': False,
            'answer_vi': 'Lỗi: Câu hỏi trống!',
            'answer_en': 'Error: Empty question!',
            'citation': 'N/A',
            'quiz': None
        }), 400
    
    response = ai_agent(question, include_quiz=True)
    return jsonify(response), 200

@app.route('/query', methods=['GET'])
def query():
    question = request.args.get('q', '').strip()
    
    if not question:
        return jsonify({'error': 'Missing question parameter'}), 400
    
    response = ai_agent(question, include_quiz=False)
    
    return jsonify({
        'question': question,
        'answer': response.get('answer_vi', 'No answer'),
        'found': response.get('found', False),
        'citation': response.get('citation', 'N/A')
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'app': 'Huong Pharmacy AI Copilot',
        'version': '3.0 (Bilingual with Quiz)',
        'features': ['Chat', 'Citation', 'Quiz Generation']
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
