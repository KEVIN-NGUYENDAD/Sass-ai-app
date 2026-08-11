const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const AGENT_CONFIGS = {
  cybersecurity: {
    name: "🔒 Cybersecurity Expert",
    model: "claude-opus-5",
    systemPrompt: `You are a Cybersecurity and Network Security expert specializing in:
- CCNA (Cisco Certified Network Associate)
- Network protocols (TCP/IP, DNS, DHCP, IPv4/IPv6)
- Firewall configuration and VLANs
- Security best practices
- Threat analysis and mitigation
- Network troubleshooting

Provide clear, step-by-step explanations with practical examples.
Always prioritize security best practices and follow industry standards.`,
    icon: "🔒",
  },
  aiml: {
    name: "🧠 AI/ML Expert",
    model: "claude-opus-5",
    systemPrompt: `You are an AI/Machine Learning expert specializing in:
- Claude API and LLM optimization
- Prompt engineering and token counting
- Semantic search and embeddings
- Model selection and deployment
- RAG (Retrieval Augmented Generation)
- Fine-tuning and model adaptation

Provide practical examples, code snippets, and performance optimization tips.
Help developers get the most from Claude and other LLMs.`,
    icon: "🧠",
  },
};

class DualAgentCoordinator {
  constructor() {
    this.conversationHistories = {
      cybersecurity: [],
      aiml: [],
    };
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async askQuestion(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  async chatWithAgent(agentType, userMessage) {
    const config = AGENT_CONFIGS[agentType];
    const history = this.conversationHistories[agentType];

    // Add user message to history
    history.push({
      role: "user",
      content: userMessage,
    });

    try {
      const response = await client.messages.create({
        model: config.model,
        max_tokens: 2048,
        system: config.systemPrompt,
        messages: history,
      });

      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Add assistant response to history
      history.push({
        role: "assistant",
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  displayMenu() {
    console.log("\n" + "=".repeat(60));
    console.log("   🤖 DUAL AGENT SYSTEM - Cybersecurity & AI/ML   ");
    console.log("=".repeat(60));
    console.log("\n📌 Select Agent:");
    console.log("  1) 🔒 Cybersecurity Expert (CCNA, Network Security)");
    console.log("  2) 🧠 AI/ML Expert (Claude API, LLM Optimization)");
    console.log("  3) 📊 View Conversation History");
    console.log("  4) 🧹 Clear Conversation");
    console.log("  5) 🚪 Exit\n");
  }

  displayHistory(agentType) {
    const history = this.conversationHistories[agentType];
    const config = AGENT_CONFIGS[agentType];

    console.log(
      `\n${"=".repeat(60)}\n   ${config.icon} ${config.name} - Conversation History\n${"=".repeat(60)}\n`
    );

    if (history.length === 0) {
      console.log("📭 No conversation yet. Start chatting!\n");
      return;
    }

    history.forEach((msg, idx) => {
      const role = msg.role === "user" ? "👤 You" : "🤖 Agent";
      console.log(`\n[${idx + 1}] ${role}:`);
      console.log(`${msg.content.substring(0, 200)}${msg.content.length > 200 ? "..." : ""}\n`);
    });
  }

  async run() {
    console.log("\n🚀 Initializing Dual Agent System...");
    console.log("✅ API Key loaded from environment");
    console.log("✅ Agents ready to chat!\n");

    let running = true;

    while (running) {
      this.displayMenu();
      const choice = await this.askQuestion("👉 Enter your choice (1-5): ");

      switch (choice.trim()) {
        case "1": {
          console.log(
            "\n🔒 Connected to Cybersecurity Expert\n" +
              'Type your question (or "back" to return)\n'
          );
          let chatting = true;
          while (chatting) {
            const message = await this.askQuestion("\n📝 Your question: ");
            if (message.toLowerCase() === "back") {
              chatting = false;
            } else if (message.trim()) {
              console.log("\n⏳ Thinking...");
              const response = await this.chatWithAgent(
                "cybersecurity",
                message
              );
              console.log(
                `\n🔒 Cybersecurity Expert:\n${response}\n${"─".repeat(60)}`
              );
            }
          }
          break;
        }

        case "2": {
          console.log(
            "\n🧠 Connected to AI/ML Expert\n" +
              'Type your question (or "back" to return)\n'
          );
          let chatting = true;
          while (chatting) {
            const message = await this.askQuestion("\n📝 Your question: ");
            if (message.toLowerCase() === "back") {
              chatting = false;
            } else if (message.trim()) {
              console.log("\n⏳ Thinking...");
              const response = await this.chatWithAgent("aiml", message);
              console.log(
                `\n🧠 AI/ML Expert:\n${response}\n${"─".repeat(60)}`
              );
            }
          }
          break;
        }

        case "3": {
          console.log("\n📊 Which agent's history?");
          console.log("  1) 🔒 Cybersecurity Expert");
          console.log("  2) 🧠 AI/ML Expert");
          const histChoice = await this.askQuestion("\n👉 Enter your choice: ");

          if (histChoice === "1") {
            this.displayHistory("cybersecurity");
          } else if (histChoice === "2") {
            this.displayHistory("aiml");
          }
          break;
        }

        case "4": {
          console.log("\n🧹 Which conversation to clear?");
          console.log("  1) 🔒 Cybersecurity Expert");
          console.log("  2) 🧠 AI/ML Expert");
          console.log("  3) Both");
          const clearChoice = await this.askQuestion("\n👉 Enter your choice: ");

          if (clearChoice === "1") {
            this.conversationHistories.cybersecurity = [];
            console.log("✅ Cybersecurity conversation cleared");
          } else if (clearChoice === "2") {
            this.conversationHistories.aiml = [];
            console.log("✅ AI/ML conversation cleared");
          } else if (clearChoice === "3") {
            this.conversationHistories.cybersecurity = [];
            this.conversationHistories.aiml = [];
            console.log("✅ All conversations cleared");
          }
          break;
        }

        case "5": {
          console.log("\n👋 Goodbye! Thanks for using Dual Agent System!");
          running = false;
          break;
        }

        default:
          console.log("❌ Invalid choice. Please try again.");
      }
    }

    this.rl.close();
  }
}

// Main execution
const coordinator = new DualAgentCoordinator();
coordinator.run().catch(console.error);
