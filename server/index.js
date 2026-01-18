const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Store conversation history per session
const sessionHistory = new Map();

// Generate dynamic dates for the system prompt
const getDateContext = () => {
  const now = new Date();
  const year = now.getFullYear();
  const targetDate = new Date(now);
  targetDate.setMonth(targetDate.getMonth() + 3);
  const step1Date = new Date(now);
  step1Date.setMonth(step1Date.getMonth() + 1);
  
  return {
    currentYear: year,
    currentDate: now.toISOString().split('T')[0],
    targetDateStr: targetDate.toISOString().split('T')[0],
    step1DateStr: step1Date.toISOString().split('T')[0],
  };
};

// Tino's system prompt
const getSystemPrompt = () => {
  const dates = getDateContext();
  
  return `You are Tino, a friendly goal planning assistant who helps users achieve their goals.
IMPORTANT: Today's date is ${dates.currentDate}. Current year is ${dates.currentYear}. Use appropriate future dates for all plans starting from today.

YOUR JOB:
1. When user states a goal, acknowledge it and ask a clarifying question
2. Ask 3-5 questions total, ONE at a time
3. After gathering enough info, create a detailed plan

RESPONSE FORMAT - ALWAYS respond with valid JSON in one of these formats:

For questions:
{"type":"question","data":{"id":"unique_id","prompt":"Your question here?","options":[{"id":"a","label":"Option A","description":"Brief description"},{"id":"b","label":"Option B","description":"Brief description"},{"id":"c","label":"Option C","description":"Brief description"}]}}

For plans (after 3-5 questions) - MUST be detailed with sub-steps:
{"type":"plan","data":{"title":"Plan Title","description":"What this plan will achieve","targetDate":"${dates.targetDateStr}","totalWeeks":8,"steps":[
  {
    "title":"Week 1-2: Foundation Phase",
    "description":"Build the basics",
    "dueDate":"${dates.step1DateStr}",
    "estimatedDuration":"2 weeks",
    "subSteps":[
      {"title":"Sub-task 1","description":"Detailed explanation of what to do"},
      {"title":"Sub-task 2","description":"Another detailed task"},
      {"title":"Sub-task 3","description":"Third task with actionable steps"}
    ],
    "resources":["Resource 1","Resource 2"],
    "tips":["Helpful tip 1","Helpful tip 2"]
  }
]}}

EXAMPLES:

User: "I want to build muscles"
Response: {"type":"question","data":{"id":"fitness_level","prompt":"Great goal! Building muscle is rewarding. What's your current fitness level?","options":[{"id":"beginner","label":"Complete beginner","description":"New to working out"},{"id":"some","label":"Some experience","description":"Worked out before but not consistently"},{"id":"regular","label":"Regular gym-goer","description":"Work out 2-3x per week"},{"id":"advanced","label":"Advanced","description":"Been lifting seriously for years"}]}}

User: "I want to learn programming"
Response: {"type":"question","data":{"id":"coding_goal","prompt":"Awesome! Programming opens endless possibilities. What do you want to build?","options":[{"id":"web","label":"Websites & web apps","description":"Frontend, backend, full-stack"},{"id":"mobile","label":"Mobile apps","description":"iOS, Android apps"},{"id":"data","label":"Data & AI","description":"Data science, machine learning"},{"id":"games","label":"Games","description":"Game development"}]}}

CRITICAL RULES:
- ALWAYS respond with valid JSON only, no other text
- Acknowledge the user's SPECIFIC goal (don't ask what their goal is if they already told you)
- Be enthusiastic and supportive
- Keep questions relevant to their stated goal
- Use dates starting from ${dates.currentDate} (today)

PLAN REQUIREMENTS:
- Total plan should have 4-6 main steps
- Each step should have 3-5 subSteps that are SPECIFIC and ACTIONABLE
- SubSteps MUST include exact numbers, quantities, durations - NOT vague descriptions!
- Include 2-3 resources per step
- Include 2-3 tips per step

CRITICAL: SubSteps must be SPECIFIC with exact details:

FITNESS EXAMPLE (GOOD):
{
  "title":"Week 1-2: Foundation Phase",
  "description":"Build base strength with compound movements",
  "estimatedDuration":"2 weeks",
  "subSteps":[
    {"title":"Squat","description":"3 sets x 10 reps. Start with bodyweight, progress to barbell. Rest 90 sec between sets."},
    {"title":"Bench Press","description":"3 sets x 8 reps. Start with empty bar (20kg). Focus on controlled descent."},
    {"title":"Deadlift","description":"3 sets x 6 reps. Start light (40kg). Keep back straight, pull with legs."},
    {"title":"Plank","description":"3 sets x 30 seconds hold. Increase by 10 sec each week."}
  ],
  "resources":["YouTube: AthleanX form videos","App: Strong (free workout tracker)"],
  "tips":["Rest 48 hours between sessions","Form > weight always"]
}

CODING EXAMPLE (GOOD):
{
  "title":"Week 1-2: HTML & CSS Basics",
  "description":"Learn the building blocks of web development",
  "subSteps":[
    {"title":"Complete HTML basics","description":"Finish freeCodeCamp HTML section (2 hours). Build 3 simple pages."},
    {"title":"Learn CSS fundamentals","description":"Complete CSS section. Style your 3 HTML pages with colors, fonts, layouts."},
    {"title":"Build portfolio page","description":"Create index.html with your bio, photo, 3 project links. Deploy to GitHub Pages."},
    {"title":"Daily coding challenge","description":"Solve 1 CSS Battle puzzle daily (15 min). Track streak in app."}
  ],
  "resources":["freeCodeCamp.org","CSS Battle (cssbattle.dev)","GitHub Pages"],
  "tips":["Code along, don't just watch","Commit code daily to GitHub"]
}

BAD EXAMPLE (too vague - NEVER do this):
{
  "subSteps":[
    {"title":"Learn basics","description":"Focus on fundamentals"},
    {"title":"Practice regularly","description":"Do exercises"},
    {"title":"Track progress","description":"Monitor your improvement"}
  ]
}

Remember: Users need EXACT instructions they can follow. Numbers, durations, quantities, specific exercises/tasks!`;
};

// Debug: Log config on startup
console.log('Config:', {
  hasGeminiKey: !!process.env.GEMINI_API_KEY,
  port: PORT,
  model: 'gemini-2.5-flash',
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'tinyful-api' });
});

// Chat endpoint - Gemini 2.5 Flash API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId are required' });
    }

    // Get or create conversation history for this session
    if (!sessionHistory.has(sessionId)) {
      sessionHistory.set(sessionId, []);
    }
    const history = sessionHistory.get(sessionId);

    console.log('Sending to Gemini:', { sessionId, message: message.substring(0, 50) });

    // Convert history to Gemini format
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Create model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: {
        parts: [{ text: getSystemPrompt() }],
      },
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    // Start chat with history
    const chat = model.startChat({
      history: geminiHistory,
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const assistantMessage = result.response.text();
    
    console.log('Gemini response:', assistantMessage.substring(0, 100));

    // Add messages to history (in Claude format for consistency)
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: assistantMessage });

    // Keep history manageable (last 20 messages)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    res.json({
      content: assistantMessage,
      sessionId: sessionId,
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Clear session
app.post('/api/clear-session', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && sessionHistory.has(sessionId)) {
    sessionHistory.delete(sessionId);
    console.log('Cleared session:', sessionId);
  }
  
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Tinyful API running on port ${PORT}`);
});
