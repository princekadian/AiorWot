/* ============================================
   AiOrNot — Text Humanizer Endpoint
   POST /api/humanize
   Body: { text: "..." }
   Returns: { humanizedText, provider }
   
   Two-pass approach:
   1. First pass: Aggressively humanize the text
   2. Second pass: Refine to eliminate any remaining AI patterns
   ============================================ */

const { callWithFallback } = require('./providers');

const HUMANIZE_PROMPT = (text) => `You are a human ghostwriter. Rewrite this text so it reads like a real person typed it out — not like AI generated or rewrote it. The goal is to completely bypass all AI detection tools.

STRICT RULES YOU MUST FOLLOW:

CONTRACTIONS & CASUALNESS:
- ALWAYS use contractions everywhere: don't, won't, can't, it's, they're, we're, that's, isn't, aren't, couldn't, wouldn't, shouldn't, I'd, we'd, I've, we've, you've, there's, here's, who's, what's.
- Write like you're explaining this to a friend. Keep it conversational.
- Use everyday words. Never sound like a textbook.

BANNED AI PHRASES — NEVER use ANY of these:
"furthermore", "moreover", "additionally", "in addition", "it's important to note", "it's worth noting", "it is worth mentioning", "in conclusion", "to summarize", "comprehensive", "delve", "landscape", "leverage", "utilize", "facilitate", "in order to", "plays a crucial role", "it is essential", "paramount", "multifaceted", "aforementioned", "groundbreaking", "underscores", "realm", "pivotal", "tapestry", "beacon", "bustling", "navigating", "embark", "fostering", "shed light", "highly significant", "crucial aspect", "key component", "vital role", "serves as", "stands as", "remains a", "continues to be", "has become increasingly", "in today's world", "in the modern era", "as a result", "consequently", "on the other hand", "having said that"

SENTENCE PATTERNS:
- Mix short punchy sentences with longer flowing ones. Like this. Then go longer when it makes sense to really drive a point home about something you care about.
- NEVER start 2 sentences in a row the same way.
- Start some sentences with "And", "But", "So", "Plus", "Thing is", "Look", "Honestly".
- Use dashes for asides — like people actually do when writing.
- Throw in a parenthetical thought here and there (keeps things real).

HUMAN VOICE:
- Add opinions and hedging: "I think", "probably", "kind of", "in my opinion", "to be fair", "honestly", "basically", "pretty much", "sort of", "the way I see it".
- Don't be perfectly balanced. Real people emphasize what matters to them.
- Vary paragraph lengths. Some paragraphs should be just one sentence.
- Occasionally address the reader: "you know?", "think about it", "right?"

WHAT TO PRESERVE:
- Keep ALL facts, data, and core arguments intact.
- Keep roughly the same length (within 20%).

OUTPUT:
- Write ONLY the rewritten text. Nothing else. No labels, no quotes, no commentary, no markdown.

TEXT:
"""
${text}
"""`;

const REFINE_PROMPT = (text) => `Read this text carefully. Your job is to make small tweaks so it sounds 100% like an authentic human wrote it from scratch. Don't do a full rewrite — just polish the rough edges.

Fix these specific things:
1. If any sentence sounds too polished or formal, make it more casual.
2. If you spot any remaining AI-sounding phrases, replace them with everyday language.
3. Make sure contractions are used everywhere possible (do not → don't, it is → it's, etc).
4. If the flow feels too organized and predictable, slightly shuffle the order or break up a long paragraph.
5. If it reads like someone is "trying to sound human" rather than actually being human, tone it down — less hedging if overdone, fewer interjections if there are too many.

Keep everything else the same. Preserve all facts. Stay roughly the same length.

Output ONLY the refined text. No commentary, no labels, no quotes, no markdown.

TEXT:
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
        // Pass 1: Aggressive humanization
        const pass1Prompt = HUMANIZE_PROMPT(truncatedText);
        const pass1Result = await callWithFallback(pass1Prompt);
        let humanizedText = cleanResponse(pass1Result.text);
        
        // Pass 2: Refinement pass to catch remaining AI patterns
        try {
            const pass2Prompt = REFINE_PROMPT(humanizedText);
            const pass2Result = await callWithFallback(pass2Prompt);
            humanizedText = cleanResponse(pass2Result.text);
        } catch (refineErr) {
            // If pass 2 fails (rate limit etc), still return pass 1 result
            console.log('[AiOrNot] Refinement pass failed, using pass 1 result:', refineErr.message);
        }
        
        return res.status(200).json({
            humanizedText,
            provider: pass1Result.provider
        });
        
    } catch (error) {
        console.error('[AiOrNot] Humanize error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

function cleanResponse(text) {
    let cleaned = text.trim();
    
    // Remove wrapping quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    
    // Remove markdown code block wrappers
    cleaned = cleaned.replace(/^```(?:\w+)?\s*/i, '').replace(/\s*```$/i, '');
    
    return cleaned.trim();
}
