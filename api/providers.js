/* ============================================
   AiOrNot — Multi-Provider API Handler
   ============================================
   Supports: Gemini, Groq, Cohere, OpenRouter
   Automatic fallback on rate limits (429) or errors.
   ============================================ */

// Provider definitions
const PROVIDERS = [
    {
        name: 'Gemini',
        envKey: 'GEMINI_API_KEY',
        buildRequest: (apiKey, prompt) => ({
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            options: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 2048
                    }
                })
            }
        }),
        parseResponse: (data) => {
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Empty response from Gemini');
            return text;
        }
    },
    {
        name: 'Groq',
        envKey: 'GROQ_API_KEY',
        buildRequest: (apiKey, prompt) => ({
            url: 'https://api.groq.com/openai/v1/chat/completions',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 2048
                })
            }
        }),
        parseResponse: (data) => {
            const text = data?.choices?.[0]?.message?.content;
            if (!text) throw new Error('Empty response from Groq');
            return text;
        }
    },
    {
        name: 'Cohere',
        envKey: 'COHERE_API_KEY',
        buildRequest: (apiKey, prompt) => ({
            url: 'https://api.cohere.com/v2/chat',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'command-r',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 2048
                })
            }
        }),
        parseResponse: (data) => {
            const text = data?.message?.content?.[0]?.text;
            if (!text) throw new Error('Empty response from Cohere');
            return text;
        }
    },
    {
        name: 'OpenRouter',
        envKey: 'OPENROUTER_API_KEY',
        buildRequest: (apiKey, prompt) => ({
            url: 'https://openrouter.ai/api/v1/chat/completions',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://aiornot.vercel.app',
                    'X-Title': 'AiOrNot'
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.3-70b-instruct:free',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 2048
                })
            }
        }),
        parseResponse: (data) => {
            const text = data?.choices?.[0]?.message?.content;
            if (!text) throw new Error('Empty response from OpenRouter');
            return text;
        }
    }
];

/**
 * Get all providers that have API keys configured
 */
function getAvailableProviders() {
    return PROVIDERS.filter(p => {
        const key = process.env[p.envKey];
        return key && key.trim().length > 0;
    });
}

/**
 * Call a provider's API with the given prompt.
 * Returns { success: boolean, text?: string, error?: string, provider: string }
 */
async function callProvider(provider, prompt) {
    const apiKey = process.env[provider.envKey];
    const { url, options } = provider.buildRequest(apiKey, prompt);
    
    try {
        const response = await fetch(url, options);
        
        // Rate limited or server error → signal fallback
        if (response.status === 429) {
            return { success: false, error: `${provider.name}: Rate limited (429)`, provider: provider.name, rateLimited: true };
        }
        
        if (response.status >= 500) {
            return { success: false, error: `${provider.name}: Server error (${response.status})`, provider: provider.name };
        }
        
        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            return { success: false, error: `${provider.name}: Error ${response.status} - ${errBody.slice(0, 200)}`, provider: provider.name };
        }
        
        const data = await response.json();
        const text = provider.parseResponse(data);
        
        return { success: true, text, provider: provider.name };
        
    } catch (err) {
        return { success: false, error: `${provider.name}: ${err.message}`, provider: provider.name };
    }
}

/**
 * Call providers in order with automatic fallback.
 * Tries each available provider; on rate limit or error, falls back to the next.
 * Returns { text: string, provider: string } or throws an error.
 */
async function callWithFallback(prompt) {
    const available = getAvailableProviders();
    
    if (available.length === 0) {
        throw new Error('No API keys configured. Please set at least one API key (GEMINI_API_KEY, GROQ_API_KEY, COHERE_API_KEY, or OPENROUTER_API_KEY) in your environment variables.');
    }
    
    const errors = [];
    
    for (const provider of available) {
        const result = await callProvider(provider, prompt);
        
        if (result.success) {
            return { text: result.text, provider: result.provider };
        }
        
        errors.push(result.error);
        console.log(`[AiOrNot] ${result.error} — trying next provider...`);
    }
    
    throw new Error(`All providers failed:\n${errors.join('\n')}`);
}

module.exports = { callWithFallback, getAvailableProviders };
