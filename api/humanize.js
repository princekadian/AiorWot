/* ============================================
   AiOrNot — Text Humanizer Endpoint
   POST /api/humanize
   Body: { text: "..." }
   Returns: { humanizedText, provider }
   ============================================ */

const { callWithFallback } = require('./providers');

const HUMANIZE_PROMPT = (text) => `You are an expert at rewriting AI-generated text to sound naturally human while preserving the original meaning.

REWRITING RULES:
1. **Vary sentence structure** — Mix short and long sentences. Don't start every sentence the same way.
2. **Use natural language** — Replace formal phrases with casual ones. Use contractions (don't, it's, you're).
3. **Remove AI patterns** — Eliminate phrases like "It's important to note", "Furthermore", "Moreover", "In conclusion", "delve", "landscape", "leverage", "utilize", "comprehensive".
4. **Add human touches** — Include slight imperfections, colloquialisms, or personal-sounding observations.
5. **Simplify vocabulary** — Replace complex words with simpler alternatives where natural.
6. **Break predictable patterns** — Rearrange ideas, merge or split sentences unexpectedly.
7. **Keep the meaning** — Don't change facts, arguments, or key information.
8. **Match the tone** — If the original is academic, keep it academic but less robotic. If casual, make it more casual.
9. **No filler** — Don't add unnecessary words just to seem human.

OUTPUT FORMAT:
- Output ONLY the rewritten text
- Do NOT include any commentary, explanations, or labels
- Do NOT wrap in quotes or markdown
- Just the rewritten text, nothing else

TEXT TO HUMANIZE:
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
    
    if (text.trim().length < 10) {
        return res.status(400).json({ error: 'Text is too short to humanize.' });
    }
    
    // Limit text length
    const truncatedText = text.slice(0, 8000);
    
    try {
        const prompt = HUMANIZE_PROMPT(truncatedText);
        const result = await callWithFallback(prompt);
        
        // Clean up the response
        let humanizedText = result.text.trim();
        
        // Remove any wrapping quotes the LLM might have added
        if ((humanizedText.startsWith('"') && humanizedText.endsWith('"')) ||
            (humanizedText.startsWith("'") && humanizedText.endsWith("'"))) {
            humanizedText = humanizedText.slice(1, -1);
        }
        
        return res.status(200).json({
            humanizedText,
            provider: result.provider
        });
        
    } catch (error) {
        console.error('[AiOrNot] Humanize error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
