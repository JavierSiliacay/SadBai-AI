import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
const PORT = 3000;

// Active User & Hug Tracking
let activeUsers = 0;
let totalHugs = 8540; // Aesthetic starting seed

io.on("connection", (socket) => {
  activeUsers++;
  io.emit("activeUsers", activeUsers);
  io.emit("totalHugs", totalHugs);
  console.log("A soul connected. Active users:", activeUsers);

  socket.on("sendHug", () => {
    totalHugs++;
    io.emit("totalHugs", totalHugs);
    socket.broadcast.emit("incomingHug");
  });

  socket.on("disconnect", () => {
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit("activeUsers", activeUsers);
    console.log("A soul disconnected. Active users:", activeUsers);
  });
});

// Stats persistence
const STATS_FILE = path.join(process.cwd(), 'stats.json');

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Error reading stats:", e);
  }
  return { visits: 1240 }; // Starting seed for aesthetic
}

function incrementVisits() {
  const stats = getStats();
  stats.visits += 1;
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats), 'utf8');
  } catch (e) {
    console.error("Error saving stats:", e);
  }
  return stats;
}

// API Routes
app.get("/api/stats", (req, res) => {
  const stats = incrementVisits();
  res.json(stats);
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m: any) => {
        const role = m.role === 'ai' ? 'assistant' : m.role;
        if (m.image) {
          const contentArray: any[] = [
            { type: "image_url", image_url: { url: m.image } }
          ];

          if (m.content && m.content.trim() !== "") {
            contentArray.push({ type: "text", text: m.content });
          } else {
            contentArray.push({ type: "text", text: "Please analyze the contents of this uploaded image." });
          }

          return { role, content: contentArray };
        }
        return { role, content: m.content };
      })
    ];

    console.log("Incoming chat request. Messages:", messages.length);
    console.log("Using Token:", process.env.HF_TOKEN ? "Present (Starts with " + process.env.HF_TOKEN.slice(0, 5) + ")" : "MISSING");

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-4-31B-it:novita",
        "messages": formattedMessages,
        "stream": true
      })
    });

    console.log("HF Router Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF Inference Error Body:", errorText);
      return res.status(response.status).json({ error: "Failed to get response from AI" });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              res.end();
              return;
            }
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                res.write(content);
              }
            } catch (e) { }
          }
        }
      }
    }
    res.end();
  } catch (error) {
    console.error("HF Inference Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to get response from AI" });
    } else {
      res.end();
    }
  }
});

app.post("/api/reflection", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-4-31B-it:novita",
        "messages": [{ role: "user", content: prompt }],
        "response_format": { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(JSON.parse(data.choices[0].message.content || "{}"));
  } catch (error) {
    console.error("HF Reflection Error:", error);
    res.status(500).json({ error: "Failed to generate reflection" });
  }
});

app.post("/api/reflect", async (req, res) => {
  try {
    const { messages, language } = req.body;
    
    const systemPrompt = `You are SadBai AI's Closure Engine. Summarize the user's emotional venting session like a deeply empathetic human friend.
    Format your response EXACTLY as a JSON object with these keys:
    "summary": A 1-2 sentence human-like summary of what happened (In ${language}).
    "truth": A powerful, human-like validation of their feelings (In ${language}).
    "nextStep": A gentle, tiny piece of human-like advice for the next 24 hours (In ${language}).
    
    Language: ${language === 'bisaya' ? 'Cebuano/Bisaya (Talk like a Bisaya Gen Z with modern slang like lowkey, omsim, dasurb, ka-vibe, for real)' : language === 'tagalog' ? 'Tagalog' : 'English'}.
    Keep it deeply empathetic, human-like, and short.`;

    const chatHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const response = await fetch("https://router.huggingface.co/novita/v3/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31B-it:novita",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log("Reflection Response:", data);
    
    if (data.choices && data.choices[0].message.content) {
      res.json(JSON.parse(data.choices[0].message.content));
    } else {
      throw new Error("Invalid response format from HF");
    }
  } catch (error) {
    console.error("Reflection Error:", error);
    res.status(500).json({ error: "Failed to generate reflection" });
  }
});

// Vite middleware
const setupVite = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
