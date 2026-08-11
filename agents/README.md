# 🤖 Dual Agent System - Cybersecurity & AI/ML Experts

A powerful conversational AI system with **2 specialized sub-agents** running on Claude.

```
┌─────────────────────────────────────────────────────┐
│  🔒 CYBERSECURITY EXPERT  │  🧠 AI/ML EXPERT      │
├─────────────────────────────────────────────────────┤
│  ✅ CCNA Topics           │  ✅ Claude API         │
│  ✅ Network Security      │  ✅ LLM Optimization   │
│  ✅ Firewalls & VLANs     │  ✅ Prompt Engineering │
│  ✅ Troubleshooting       │  ✅ Semantic Search    │
│  ✅ Best Practices        │  ✅ Model Deployment   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **1. Setup (1 minute)**
```bash
cd agents
npm install
```

### **2. Configure API Key**
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### **3. Run Agents**
```bash
npm start
```

---

## 📋 Features

### **🔒 Cybersecurity Agent**
Expert in:
- **CCNA Certification** - Network fundamentals, routing, switching
- **Network Protocols** - TCP/IP, DNS, DHCP, IPv4/IPv6, BGP
- **Security** - Firewalls, VLANs, Access Control Lists (ACL)
- **Troubleshooting** - Network diagnostics and problem-solving
- **Best Practices** - Industry standards and compliance

**Example Questions:**
- "What's VLAN and how to configure it?"
- "Explain DHCP step-by-step"
- "How to troubleshoot IPv6?"
- "Design a secure network topology"

### **🧠 AI/ML Agent**
Expert in:
- **Claude API** - Models, pricing, authentication
- **LLM Optimization** - Token counting, prompt caching, batching
- **Semantic Search** - Embeddings, retrieval, RAG systems
- **Prompt Engineering** - Technique, few-shot learning, chain-of-thought
- **Model Selection** - Choosing right model for your use case
- **Deployment** - Production setup, monitoring, scaling

**Example Questions:**
- "How to optimize semantic search?"
- "Token counting tips for Claude?"
- "Build a RAG system step-by-step"
- "Deploy Claude API to production"

---

## 🎯 Usage

### **Interactive Menu**
```
   🤖 DUAL AGENT SYSTEM - Cybersecurity & AI/ML   
═════════════════════════════════════════════════════════

📌 Select Agent:
  1) 🔒 Cybersecurity Expert (CCNA, Network Security)
  2) 🧠 AI/ML Expert (Claude API, LLM Optimization)
  3) 📊 View Conversation History
  4) 🧹 Clear Conversation
  5) 🚪 Exit
```

### **Chat Example**

**User:** `1` (Select Cybersecurity Expert)
```
🔒 Connected to Cybersecurity Expert
Type your question (or "back" to return)

📝 Your question: What is VLAN and how to configure it?

⏳ Thinking...

🔒 Cybersecurity Expert:
VLAN (Virtual Local Area Network) is a logical subdivision of a network...
[Detailed explanation]
```

---

## 📁 File Structure

```
agents/
├── dual-agents-coordinator.js    ← Main application
├── package.json                  ← Dependencies
├── README.md                     ← This file
├── .env.example                  ← Environment template
└── examples/
    ├── cybersecurity-prompts.md  ← Sample questions
    └── aiml-prompts.md           ← Sample questions
```

---

## ⚙️ Configuration

### **Agent Models**
Both agents use **Claude 3 Opus** (most capable):
```javascript
const config = {
  cybersecurity: { model: "claude-opus-5" },
  aiml: { model: "claude-opus-5" },
};
```

### **Customizing Agents**

Edit `dual-agents-coordinator.js` in `AGENT_CONFIGS`:

```javascript
AGENT_CONFIGS = {
  cybersecurity: {
    name: "🔒 Cybersecurity Expert",
    systemPrompt: "Your custom prompt here...",
    icon: "🔒",
  },
  aiml: {
    name: "🧠 AI/ML Expert",
    systemPrompt: "Your custom prompt here...",
    icon: "🧠",
  },
};
```

---

## 🔧 Commands

### **Run Interactive**
```bash
npm start
```

### **Run with Watch Mode**
```bash
npm run dev
```

### **Install Dependencies**
```bash
npm run setup
```

---

## 💬 API Architecture

### **Conversation Flow**
```
User Input
    ↓
[Select Agent] → 1: Cybersecurity or 2: AI/ML
    ↓
[Message History] → Keep conversation context
    ↓
[Claude API] → Send with system prompt
    ↓
[Response] → Display to user
    ↓
[Store History] → Remember for next turn
```

### **Multi-turn Conversations**
Each agent maintains its own conversation history:
```javascript
conversationHistories = {
  cybersecurity: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." },
  ],
  aiml: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." },
  ],
};
```

---

## 🔒 Security

✅ API key stored in environment variable (not in code)  
✅ No data persistence (stateless per session)  
✅ Conversation history only in memory  
✅ Uses official Anthropic SDK  

**Best Practice:**
```bash
# Never commit API keys
export ANTHROPIC_API_KEY="sk-ant-..."
npm start
```

---

## 📊 Token Usage

### **Typical Conversation**
- **Input:** ~100-500 tokens per question
- **Output:** ~500-1500 tokens per response
- **Cost:** ~$0.01-0.05 per Q&A pair (Opus pricing)

### **Optimize**
- Clear old conversations to reduce context
- Use shorter, focused questions
- Reuse relevant responses

---

## 🐛 Troubleshooting

### **Problem: API Key Not Found**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm start
```

### **Problem: Module Not Found**
```bash
npm install
npm start
```

### **Problem: Slow Response**
- Check internet connection
- Try simpler questions
- Clear conversation history

---

## 📚 Example Conversations

### **Cybersecurity Agent**
```
Q: "Explain DHCP protocol step by step"
A: DHCP (Dynamic Host Configuration Protocol) is...
   1. Client sends DISCOVER
   2. Server sends OFFER
   3. [Full explanation with diagrams]
```

### **AI/ML Agent**
```
Q: "How to optimize semantic search with Claude?"
A: Semantic search optimization involves...
   1. Use embeddings model
   2. Implement caching
   3. [Code examples included]
```

---

## 🚀 Production Setup

### **Environment Variables**
Create `.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key
NODE_ENV=production
```

### **Docker Deployment**
```dockerfile
FROM node:18-slim
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
```

### **Run with PM2**
```bash
npm install -g pm2
pm2 start dual-agents-coordinator.js --name "dual-agents"
pm2 logs dual-agents
```

---

## 📞 Support

**Questions about Agents?**
- Check: `examples/cybersecurity-prompts.md`
- Check: `examples/aiml-prompts.md`

**API Documentation?**
- https://docs.anthropic.com/
- https://console.anthropic.com/

**Report Issues?**
- Create issue on GitHub
- Check logs: `npm start 2>&1 | tee app.log`

---

## 📄 License

MIT License - Open source and free to use

---

## ✨ Features Roadmap

- [ ] Add persistence (save conversation history)
- [ ] Web UI (Express + React)
- [ ] Voice interface (speech-to-text)
- [ ] Add more specialized agents
- [ ] Integration with knowledge base
- [ ] Rate limiting and usage tracking

---

**Status:** ✅ Ready to use  
**Version:** 1.0.0  
**Last Updated:** 2026-08-11  
**Powered by:** Claude Opus 5 + Anthropic SDK

🚀 **Start chatting now:** `npm start`
