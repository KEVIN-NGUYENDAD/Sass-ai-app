const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

if (!ANTHROPIC_API_KEY) {
  console.error("❌ Error: ANTHROPIC_API_KEY not set in environment");
  process.exit(1);
}

console.log("🚀 Dual Agent Server Starting...");
console.log(`📍 Port: ${PORT}`);
console.log(`🔑 API Key: ${ANTHROPIC_API_KEY.substring(0, 10)}...`);

const AGENT_CONFIGS = {
  cybersecurity: {
    name: "🔒 Cybersecurity Expert",
    systemPrompt: `You are a Cybersecurity and Network Security expert specializing in:
- CCNA (Cisco Certified Network Associate)
- Network protocols (TCP/IP, DNS, DHCP, IPv4/IPv6)
- Firewall configuration and VLANs
- Security best practices
- Threat analysis and mitigation
- Network troubleshooting

Provide clear, step-by-step explanations with practical examples.
Always prioritize security best practices and follow industry standards.`,
  },
  aiml: {
    name: "🧠 AI/ML Expert",
    systemPrompt: `You are an AI/Machine Learning expert specializing in:
- Claude API and LLM optimization
- Prompt engineering and token counting
- Semantic search and embeddings
- Model selection and deployment
- RAG (Retrieval Augmented Generation)
- Fine-tuning and model adaptation

Provide practical examples, code snippets, and performance optimization tips.
Help developers get the most from Claude and other LLMs.`,
  },
};

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "✅ Dual Agent Server Running",
    agents: Object.keys(AGENT_CONFIGS),
    version: "1.0.0",
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { agent, messages } = req.body;

    if (!agent || !AGENT_CONFIGS[agent]) {
      return res.status(400).json({ error: "Invalid agent" });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const config = AGENT_CONFIGS[agent];

    // Call Anthropic API
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-opus-5",
        max_tokens: 2048,
        system: config.systemPrompt,
        messages: messages,
      },
      {
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.content[0]?.text || "";

    res.json({
      success: true,
      agent: agent,
      message: content,
      usage: response.data.usage,
    });
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

// Get agent info
app.get("/api/agents", (req, res) => {
  res.json({
    agents: Object.entries(AGENT_CONFIGS).map(([key, config]) => ({
      id: key,
      name: config.name,
    })),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔒 Cybersecurity Expert - Ready`);
  console.log(`🧠 AI/ML Expert - Ready`);
  console.log(`\n💬 Open in browser to start chatting!\n`);
});
