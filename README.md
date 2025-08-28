# Smart Assistant Backend (TTS + Summarizer)

This project is a simple backend service built with **Node.js, Express, and Axios**.  

This project demonstrates a small backend service that integrates with:
1. **ElevenLabs API** → Generate a voice message from text (Text-to-Speech).
2. **Perplexity API (with OpenAI fallback)** → Summarize or answer questions.

---
### Reflection
The main challenge I faced was with the Perplexity search model, since I could not get a valid API key in time, which limited the functionality of that part. On the UI side, I would have loved to improve the design and make it more user-friendly. For the text-to-speech feature, my idea was to let users choose between multiple available voices or even upload/record their own voice and use it for synthesis. 

If I had more time, I would also focus on:
- Adding proper error handling and loading states.  
- Writing more unit tests to ensure reliability.  
- Improving accessibility and responsive design.  

## 🚀 Features
1. **Text-to-Speech (TTS)**  
   - Converts user text into a natural voice.  
   - Uses ElevenLabs API.  
   - Returns audio as Base64 (can be played directly in frontend).  

2. **Smart Summarizer (Q&A)**  
   - Takes a user question or long text.  
   - Sends it to Perplexity API.  (or OpenAI if Perplexity key is not provided).
   - Fallback system: if `PERPLEXITY_API_KEY` is missing, the app will use `OPENAI_API_KEY`.
   - Returns a short summarized question and response of the question.  
   - Can be auto-copied to clipboard on frontend.  

---

## ⚙️ Tech Stack
- **Node.js** + **Express** → Backend framework  
- **Axios** → For making API requests  
- **dotenv** → To manage API keys securely  
- **CORS** → For frontend-backend communication  

---

## 📦 Installation

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd project-folder

## Front end repo 
https://github.com/Eman-Qadry/Micro-Challenge_frontEnt
