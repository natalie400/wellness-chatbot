const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(cors());         
app.use(express.static('.')); // Serves index.html from the root folder

// --- CONFIGURATION ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// Hard-coded Safety Layer
const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'harm myself', 
    'hurt myself', 'self-harm', 'cutting myself'
];

// --- ROUTES ---

// Deployment Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "Lulu's brain is online." });
});

// Chat Logic
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();

    // 1. SAFETY CHECK
    const containsCrisisWord = CRISIS_KEYWORDS.some(word => lowerMessage.includes(word));
    
    if (containsCrisisWord) {
      return res.json({ 
        reply: "I'm concerned about what you're sharing. Please know you're not alone. You can reach out to the National Suicide Prevention Lifeline at 988 or text HOME to 741741 to connect with the Crisis Text Line. Your safety is the most important thing." 
      });
    }

    // 2. AI CONVERSATION
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a supportive mental wellness companion named Lulu. You listen empathetically, suggest mindfulness exercises, and never give medical diagnoses. Always remain kind and encouraging." 
        },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Something went wrong with the AI connection." });
  }
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Wellness Server running on http://localhost:${PORT}`);
});

// Export for Vercel Serverless Functions
module.exports = app;