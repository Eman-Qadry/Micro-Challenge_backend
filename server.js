// Import required packages
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env
dotenv.config();

// Create an Express application
const app = express();

// Middleware: enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Utility function to clean markdown formatting from text
function cleanText(text) {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

/**
 * POST /api/tts  
 * Description: Receives text from the client and converts it into speech
 * using the ElevenLabs Text-to-Speech API.
 */
app.post("/api/tts", async (req, res) => {
  try {
    // Extract text from request body
    const { text } = req.body;

    // Send text to ElevenLabs API
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`, // Replace <VOICE_ID> with an actual ID from your ElevenLabs account
      {
        text,
        voice_settings: {
          stability: 0.5,         // Controls how stable the voice sounds (0 = more variation, 1 = flat/monotone)
          similarity_boost: 0.75, // Controls how close the voice is to the original speaker
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY, // Secure API key stored in .env
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // Important to handle audio data as binary
      }
    );

    // Convert audio (binary data) to Base64 for frontend usage
    const audioBase64 = Buffer.from(response.data, "binary").toString("base64");

    // Send back the Base64 audio to the client
    res.json({ audio: audioBase64 });

  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(500).json({ error: "Failed to convert text to speech" });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    let summary, answer;

    if (process.env.PERPLEXITY_API_KEY) {
      // ================================
      // OPTION 1: Use Perplexity API
      // ================================
      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "sonar-small-chat", // Perplexity free/fast model
          messages: [
            { role: "system", content: "You are a helpful assistant that summarizes and answers questions clearly." },
            { role: "user", content: `First, summarize this question clearly. Then, provide a short and direct answer.\nQuestion: ${question}` }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Extract response text
      const content = response.data.choices[0].message.content;

      // Split content into summary + answer (assuming assistant formats output properly)
      const parts = content.split("Answer:");
      summary = parts[0].replace("Summary:", "").trim();
      answer = parts[1] ? parts[1].trim() : "No answer provided";
      // Clean markdown formatting
      summary = cleanText(parts[0].replace("Summary:", "")); 
      answer = cleanText(parts[1] || "No answer provided");

    } else if (process.env.OPENAI_API_KEY) {
      // ================================
      // OPTION 2: Fallback to OpenAI API
      // ================================
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // Lightweight & cost-efficient OpenAI model
          messages: [
            { role: "system", content: "You are a helpful assistant that summarizes and answers questions clearly." },
            { role: "user", content: `First, summarize this question clearly. Then, provide a short and direct answer.\nQuestion: ${question}` }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Extract response text
      const content = response.data.choices[0].message.content;

      // Split content into summary + answer
      const parts = content.split("Answer:");
      summary = parts[0].replace("Summary:", "").trim();
      answer = parts[1] ? parts[1].trim() : "No answer provided";
      // Clean markdown formatting
      summary = cleanText(parts[0].replace("Summary:", ""));
      answer = cleanText(parts[1] || "No answer provided");

    } else {
      return res.status(400).json({
        error: "No API key found. Please provide PERPLEXITY_API_KEY or OPENAI_API_KEY in .env"
      });
    }

    // Send back both summary and answer to the frontend
    res.json({ summary, answer });

  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(500).json({ error: "Failed to summarize/answer question" });
  }
});

// Start the server
app.listen(5000, () => console.log(" Backend running on port 5000"));



