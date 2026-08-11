const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.static("public"));

if (!ANTHROPIC_API_KEY) {
  console.error("❌ Error: ANTHROPIC_API_KEY not set in environment");
  process.exit(1);
}

const startTime = Date.now();

console.log("🚀 Dual Agent Server Starting...");
console.log(`📍 Port: ${PORT}`);
console.log(`🔑 API Key: ${ANTHROPIC_API_KEY.substring(0, 10)}...`);
console.log(`🌍 Environment: ${NODE_ENV}`);

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
  const startTime = Date.now();

  try {
    const { agent, messages } = req.body;

    // Validate agent
    if (!agent || !AGENT_CONFIGS[agent]) {
      return res.status(400).json({ error: "Invalid agent specified" });
    }

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: "Messages array is empty" });
    }

    // Validate message content
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ error: "Invalid message format" });
      }
      if (typeof msg.content !== "string" || msg.content.length > 5000) {
        return res.status(400).json({ error: "Message content invalid or too long" });
      }
    }

    const config = AGENT_CONFIGS[agent];
    const requestStartTime = Date.now();

    // Call Anthropic API with timeout
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
        timeout: 30000, // 30 second timeout
      }
    );

    const content = response.data.content[0]?.text || "";
    const apiTime = Date.now() - requestStartTime;

    console.log(`✅ Chat completed - Agent: ${agent}, Time: ${apiTime}ms, Tokens: ${response.data.usage?.output_tokens}`);

    res.json({
      success: true,
      agent: agent,
      message: content,
      usage: response.data.usage,
    });
  } catch (error) {
    const errorTime = Date.now() - startTime;

    if (error.code === "ECONNABORTED") {
      console.error(`⏱️ Timeout after ${errorTime}ms`);
      return res.status(504).json({ error: "Request timeout - API took too long" });
    }

    if (error.response?.status === 401) {
      console.error("❌ Auth Error: Invalid API key");
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (error.response?.status === 429) {
      console.error("⚠️ Rate limited by API");
      return res.status(429).json({ error: "Rate limited - please retry in a moment" });
    }

    const errorMsg = error.response?.data?.error?.message || error.message || "Unknown error";
    console.error(`❌ API Error (${errorTime}ms):`, errorMsg);

    res.status(error.response?.status || 500).json({
      success: false,
      error: errorMsg,
    });
  }
});

// Get agent info
app.get("/api/agents", (req, res) => {
  console.log("📋 Agents requested");
  res.json({
    agents: Object.entries(AGENT_CONFIGS).map(([key, config]) => ({
      id: key,
      name: config.name,
    })),
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 400 ? "❌" : "✅";
    console.log(`${statusColor} ${req.method} ${req.path} - ${status} (${duration}ms)`);
  });
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  const uptime = Date.now() - startTime;
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`🔒 Cybersecurity Expert - Ready`);
  console.log(`🧠 AI/ML Expert - Ready`);
  console.log(`⏱️ Startup time: ${uptime}ms`);
  console.log(`\n💬 Open in browser to start chatting!\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
