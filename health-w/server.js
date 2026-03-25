const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();


app.use(express.json()); 
app.use(cors());         
app.use(express.static('.'));


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// Safety Keywords for Crisis Detection
const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'harm myself', 
    'hurt myself', 'self-harm', 'cutting myself'
];

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();

    const containsCrisisWord = CRISIS_KEYWORDS.some(word => lowerMessage.includes(word));
    
    if (containsCrisisWord) {
      return res.json({ 
        reply: "I'm concerned about what you're sharing. Please know you're not alone. You can reach out to the National Suicide Prevention Lifeline at 988 or text HOME to 741741 to connect with the Crisis Text Line. Your safety is the most important thing." 
      });
    }

    // 2. AI CONVERSATION: If safe, proceed to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a supportive mental wellness companion. You listen empathetically, suggest mindfulness exercises, and never give medical diagnoses or clinical advice. Always remain kind and encouraging." 
        },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error("Error with OpenAI:", error);
    res.status(500).json({ error: "Something went wrong with the AI connection." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Wellness Server running on http://localhost:${PORT}`));