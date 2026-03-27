/* ============================================
   AiOrNot — Text Humanizer Endpoint
   POST /api/humanize
   Body: { text: "..." }
   Returns: { humanizedText, provider }
   ============================================ */

const { callWithFallback } = require('./providers');

const HUMANIZE_PROMPT = (text) => `You are a human ghostwriter. Your job is to rewrite the following text so that it reads as if a real person wrote it from scratch — not like AI rewrote it. The goal is to fool AI detectors completely.

CRITICAL RULES — follow ALL of these strictly:

SENTENCE STRUCTURE:
- Vary sentence lengths dramatically. Mix very short sentences (3-6 words) with medium and occasionally long ones.
- Start sentences differently each time. NEVER start two consecutive sentences the same way.
- Use fragments occasionally. Like this. It's natural.
- Combine some ideas into run-on-ish sentences connected with "and" or dashes — the way people actually write.

WORD CHOICE:
- ALWAYS use contractions: don't, won't, can't, it's, they're, we're, that's, isn't, aren't, couldn't, wouldn't, shouldn't, I'd, we'd, they'd, I've, we've, you've.
- NEVER use these AI-giveaway words/phrases: "furthermore", "moreover", "additionally", "it's important to note", "it's worth noting", "in conclusion", "comprehensive", "delve", "landscape", "leverage", "utilize", "facilitate", "in order to", "plays a crucial role", "it is essential", "paramount", "multifaceted", "aforementioned", "groundbreaking", "underscores", "realm", "pivotal", "tapestry", "beacon", "bustling", "navigating", "embark", "fostering".
- Replace formal words with everyday ones: "utilize" → "use", "demonstrate" → "show", "approximately" → "about", "regarding" → "about", "numerous" → "lots of" or "many", "sufficient" → "enough", "commence" → "start", "endeavor" → "try".

HUMAN IMPERFECTIONS:
- Add personal-sounding observations: "honestly", "to be fair", "the thing is", "look", "here's the deal", "the way I see it".
- Use casual transitions: "So", "Anyway", "Thing is", "Plus", "And honestly", "But here's the thing", "Now".
- Include mild hedging like real people do: "I think", "probably", "kind of", "sort of", "pretty much", "basically".
- Occasionally use parenthetical asides (like this) or em dashes — they feel natural.

STRUCTURE:
- Don't follow the exact same paragraph structure as the original. Reorganize slightly.
- Don't make every paragraph the same length. Some should be just 1-2 sentences.
- Avoid perfectly balanced arguments. Real writing emphasizes some points more than others.
- Don't use bullet points or numbered lists unless the original absolutely requires them.

ABSOLUTE REQUIREMENTS:
- Preserve ALL factual information and core arguments.
- The output must be similar in length to the input (within 20%).
- Output ONLY the rewritten text — no commentary, no labels, no quotes, no markdown formatting.

TEXT TO REWRITE:
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
