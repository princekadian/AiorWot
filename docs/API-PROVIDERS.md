# API Providers Guide

AiOrNot supports multiple free AI API providers. Here's how to get keys for each.

---

## 🟢 Google Gemini (Recommended)

**Free tier:** Very generous (1,500 requests/day for Gemini Flash)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and add it to your `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

---

## ⚡ Groq (Fastest)

**Free tier:** 30 requests/minute, 14,400 requests/day

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Sign in
3. Go to **API Keys** in the sidebar
4. Click **"Create API Key"**
5. Copy the key and add it to your `.env`:
   ```
   GROQ_API_KEY=your_key_here
   ```

---

## 🔵 Cohere

**Free tier:** 1,000 API calls/month (Trial keys)

1. Go to [dashboard.cohere.com](https://dashboard.cohere.com)
2. Sign up / Sign in
3. Go to **API Keys**
4. Copy your **Trial key**
5. Add it to your `.env`:
   ```
   COHERE_API_KEY=your_key_here
   ```

---

## 🟣 OpenRouter

**Free tier:** Access to free models (e.g., Llama 3.3 70B)

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up / Sign in
3. Go to **Keys** in your dashboard
4. Create a new key
5. Add it to your `.env`:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```

> **Note:** OpenRouter offers many free models. AiOrNot uses `meta-llama/llama-3.3-70b-instruct:free` by default.

---

## 💡 Tips

- **Start with Groq** — It's the fastest and has a generous free tier
- **Add Gemini as backup** — Great fallback with a very high daily limit
- **More keys = more resilience** — If one provider rate-limits you, the app automatically switches to the next
- You can use **all four providers** simultaneously for maximum availability
