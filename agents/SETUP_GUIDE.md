# 🚀 Quick Setup Guide - Dual Agent System

Get the system running in **3 easy steps**!

---

## **Step 1️⃣: Install Dependencies (1 min)**

```bash
cd agents
npm install
```

✅ This installs:
- `@anthropic-ai/sdk` - Official Claude API SDK
- All required Node.js modules

---

## **Step 2️⃣: Set API Key (1 min)**

### **Get API Key**
1. Go to: https://console.anthropic.com/
2. Login with your account
3. Create new API key
4. Copy the key (starts with `sk-ant-`)

### **Set Environment Variable**

**On macOS/Linux:**
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

**On Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-your-key-here"
```

**Or create `.env` file:**
```bash
cp .env.example .env
# Edit .env and add your API key
nano .env
```

---

## **Step 3️⃣: Run the System (1 min)**

```bash
npm start
```

You should see:
```
🚀 Initializing Dual Agent System...
✅ API Key loaded from environment
✅ Agents ready to chat!

   🤖 DUAL AGENT SYSTEM - Cybersecurity & AI/ML   
═════════════════════════════════════════════════════════

📌 Select Agent:
  1) 🔒 Cybersecurity Expert (CCNA, Network Security)
  2) 🧠 AI/ML Expert (Claude API, LLM Optimization)
  3) 📊 View Conversation History
  4) 🧹 Clear Conversation
  5) 🚪 Exit

👉 Enter your choice (1-5): 
```

✅ **You're ready to chat!**

---

## 💬 First Chat

### **Try Cybersecurity Agent**
```
Enter your choice: 1

🔒 Connected to Cybersecurity Expert
Type your question (or "back" to return)

📝 Your question: What is VLAN?

⏳ Thinking...

🔒 Cybersecurity Expert:
VLAN (Virtual Local Area Network) is...
[Detailed explanation]
```

### **Try AI/ML Agent**
```
Enter your choice: 2

🧠 Connected to AI/ML Expert
Type your question (or "back" to return)

📝 Your question: How to optimize semantic search with Claude?

⏳ Thinking...

🧠 AI/ML Expert:
Semantic search optimization involves...
[Detailed explanation]
```

---

## 🔧 Troubleshooting

### **Problem: "API Key Not Found"**
```
Error: API key not found in environment
```

**Solution:**
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"
npm start
```

### **Problem: "Module not found: @anthropic-ai/sdk"**
```
Error: Cannot find module '@anthropic-ai/sdk'
```

**Solution:**
```bash
npm install
npm start
```

### **Problem: "Rate limit exceeded"**
This means you've made too many requests quickly.

**Solution:**
- Wait a few seconds
- Try again with simpler questions
- Check your API usage at: https://console.anthropic.com/

---

## 📚 Documentation

### **Main Files**
- `README.md` - Full documentation
- `dual-agents-coordinator.js` - Main code
- `package.json` - Dependencies

### **Example Prompts**
- `examples/cybersecurity-prompts.md` - CCNA & Security questions
- `examples/aiml-prompts.md` - Claude API & LLM questions

---

## 🎯 Next Steps

### **Learn More**
- Read: `README.md` for full features
- Check: `examples/cybersecurity-prompts.md` for CCNA topics
- Check: `examples/aiml-prompts.md` for AI/ML topics

### **Customize**
- Edit `dual-agents-coordinator.js` to modify agents
- Change system prompts for different expertise
- Add more specialized agents

### **Deploy**
- See: `README.md` section "Production Setup"
- Docker deployment instructions included
- PM2 setup guide provided

---

## ✨ Features

✅ 2 specialized AI agents  
✅ Multi-turn conversations  
✅ Conversation history tracking  
✅ Clear conversation option  
✅ Interactive menu  
✅ Real-time responses  

---

## 📞 Need Help?

**Can't find API key?**
→ https://console.anthropic.com/

**Problems with installation?**
→ Check: `npm install` output

**Agent acting weird?**
→ Clear conversation: Menu option 4

**Want different agents?**
→ Edit: `AGENT_CONFIGS` in `dual-agents-coordinator.js`

---

## 🎉 You're All Set!

**Run:** `npm start`  
**Chat:** Select agent 1 or 2  
**Enjoy:** 🔒 & 🧠 specialized knowledge!

---

**Created:** 2026-08-11  
**Version:** 1.0.0  
**Status:** ✅ Ready to use
