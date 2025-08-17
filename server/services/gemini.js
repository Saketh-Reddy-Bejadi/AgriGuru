const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const systemInstruction = [
  {
    text: `You are AgriGuru, an AI-powered agricultural advisor. 
Given a farmer’s data (location, soil type, farm size, irrigation method, and crop history), recommend the best crops to plant next season. 
Explain your reasoning for each recommendation, considering local climate, soil compatibility, crop rotation, and market trends. 
If information is missing, state your assumptions. 
Be concise and use language that is easy for farmers to understand.`,
  }
];

async function getGeminiRecommendation(userPrompt) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const config = {
    thinkingConfig: { thinkingBudget: -1 },
    responseMimeType: 'text/plain',
    systemInstruction,
  };
  const model = 'gemini-2.5-flash';
  const contents = [
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = '';
  for await (const chunk of response) {
    result += chunk.text;
  }
  return result;
}

module.exports = { getGeminiRecommendation };