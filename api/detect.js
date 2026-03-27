/* ============================================
   AiOrNot — AI Detection Endpoint
   POST /api/detect
   Body: { text: "..." }
   Returns: { score, sentences, reasoning, provider }
   ============================================ */

const { callWithFallback } = require('./providers');

const DETECTION_PROMPT = (text) => `You are an expert AI-generated text detector. Analyze the following text and determine how likely it is to be AI-generated.

STRONG AI INDICATORS (score HIGH, 60-100%):
- Formal language without contractions ("do not" instead of "don't", "it is" instead of "it's")
- Repetitive sentence structures — every sentence starts the same way or follows the same pattern
- AI buzzwords: "furthermore", "moreover", "additionally", "it's important to note", "delve", "landscape", "leverage", "utilize", "comprehensive", "multifaceted", "paramount", "fostering", "tapestry", "beacon", "navigating", "embark", "realm", "pivotal", "groundbreaking", "underscores"
- Perfectly balanced arguments with no personal opinion
- Generic filler statements that add no real information
- Overly organized structure with predictable transitions
- Every paragraph being roughly the same length

STRONG HUMAN INDICATORS (score LOW, 0-25%):
-  Contractions used naturally (don't, it's, they're, won't, can't)
- Varied sentence lengths — mix of short and long sentences
- Casual/conversational tone with personal voice
- Informal transitions: "So", "But", "And", "Thing is", "Look", "Honestly"
- Personal hedging: "I think", "probably", "kind of", "sort of", "basically"
- Parenthetical asides, dashes, and sentence fragments
- Unpredictable word choices and sentence starters
- Opinions and emotional expression
- Imperfect or casual grammar that still reads naturally
- Addressing the reader directly

CALIBRATION RULES:
- Text that uses lots of contractions and casual language = LIKELY HUMAN (0-20%)
- Well-written human text with good grammar is NOT automatically AI — look for the specific AI patterns above
- The presence of informal expressions, hedging, and personal voice is a very strong human signal
- Only flag text as AI if it has MULTIPLE strong AI indicators
- A single AI-like phrase in otherwise casual text does NOT make it AI

Provide your analysis in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "score": <number 0-100, where 0 = definitely human, 100 = definitely AI>,
  "reasoning": "<2-3 sentence explanation of your verdict>",
  "sentences": [
    { "text": "<exact sentence from the input>", "score": <number 0-100> }
  ]
}

RULES:
- Break the text into individual sentences for the "sentences" array
- Each sentence gets its own AI score (0-100)
- The overall "score" should reflect the weighted assessment
- Only output valid JSON, nothing else

TEXT TO ANALYZE:
"""
${text}
"""`;

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { text } = req.body || {};
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }
    
    if (text.trim().length < 20) {
        return res.status(400).json({ error: 'Text is too short for meaningful analysis. Please provide at least a few sentences.' });
    }
    
    // Limit text length to avoid API issues
    const truncatedText = text.slice(0, 8000);
    
    try {
        const prompt = DETECTION_PROMPT(truncatedText);
        const result = await callWithFallback(prompt);
        
        // Parse the JSON response from the LLM
        let parsed;
        try {
            // Clean up response — remove markdown code blocks if present
            let cleaned = result.text.trim();
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            parsed = JSON.parse(cleaned);
        } catch (parseErr) {
            console.error('[AiOrNot] Failed to parse LLM response:', result.text);
            // Fallback: try to extract score with regex
            const scoreMatch = result.text.match(/"score"\s*:\s*(\d+)/);
            parsed = {
                score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
                reasoning: 'Analysis completed but response format was unexpected.',
                sentences: []
            };
        }
        
        return res.status(200).json({
            score: Math.min(100, Math.max(0, parsed.score || 0)),
            reasoning: parsed.reasoning || '',
            sentences: Array.isArray(parsed.sentences) ? parsed.sentences.map(s => ({
                text: s.text || '',
                score: Math.min(100, Math.max(0, s.score || 0))
            })) : [],
            provider: result.provider
        });
        
    } catch (error) {
        console.error('[AiOrNot] Detection error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
