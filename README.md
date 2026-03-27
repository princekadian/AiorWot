# 🔍 AiorWot

**Detect AI-generated text instantly and humanize it — for free.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fprincekadian%2FAiorWot&env=GROQ_API_KEY&envDescription=At%20least%20one%20API%20key%20is%20required.%20See%20docs%2FAPI-PROVIDERS.md%20for%20all%20options.&project-name=aiorwot)

---

## ✨ Features

- 🔍 **AI Detection** — Paste text and get an AI probability score (0-100%)
- 📊 **Sentence-Level Analysis** — See which sentences look AI-written
- ✏️ **Text Humanizer** — Rewrite AI text to sound naturally human (2-pass system)
- 🔄 **Multi-Provider Fallback** — Automatically switches APIs on rate limits
- 🆓 **100% Free** — Uses free-tier APIs (Gemini, Groq, Cohere, OpenRouter)
- 🌐 **Deploy Anywhere** — One-click Vercel deploy or self-host locally
- 🔓 **Open Source** — MIT licensed, contributions welcome

---

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. Click the **"Deploy with Vercel"** button above
2. Add at least one API key in the environment variables
3. Deploy — your site is live!

### Option 2: Run Locally

```bash
# Clone the repo
git clone https://github.com/princekadian/AiorWot.git
cd AiorWot

# Copy env template and add your API keys
cp .env.example .env
# Edit .env and add at least one API key

# Install Vercel CLI (if not installed)
npm i -g vercel

# Run locally
vercel dev
```

Open `http://localhost:3000` 🎉

---

## 🔑 API Providers (All Free)

You need **at least one** API key. More keys = better fallback when rate limited.

| Provider | Free Tier | Get Key |
|----------|-----------|---------|
| **Google Gemini** | Very generous | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Groq** | Very fast, generous | [console.groq.com](https://console.groq.com/keys) |
| **Cohere** | 1,000 calls/month | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| **OpenRouter** | Free models available | [openrouter.ai](https://openrouter.ai/keys) |

See [docs/API-PROVIDERS.md](docs/API-PROVIDERS.md) for detailed setup guides.

---

## 🔄 How Fallback Works

```
User sends text → Try Provider 1 (e.g., Groq)
                     ↓ Rate limited (429)?
                  Try Provider 2 (e.g., Gemini)
                     ↓ Error?
                  Try Provider 3 (e.g., Cohere)
                     ↓ Error?
                  Try Provider 4 (e.g., OpenRouter)
                     ↓ All failed?
                  Return error to user
```

---

## 📁 Project Structure

```
AiorWot/
├── public/           # Frontend (static files)
│   ├── index.html    # Main page
│   ├── style.css     # Styles
│   ├── script.js     # Frontend logic
│   ├── favicon.png   # Favicon
│   └── og-image.png  # Open Graph preview image
├── api/              # Backend (Vercel Serverless Functions)
│   ├── providers.js  # Multi-provider handler with fallback
│   ├── detect.js     # AI detection endpoint
│   └── humanize.js   # Text humanizer endpoint (2-pass)
├── docs/             # Documentation
├── .env.example      # API key template
├── vercel.json       # Vercel config
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Ideas for contributions:
- Add more API providers
- Improve detection prompts
- Add language support
- UI improvements
- Add batch text analysis

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

## ⚠️ Disclaimer

This tool uses LLM-based analysis to estimate AI probability. No AI detector is 100% accurate. Results should be used as guidance, not definitive proof. Use responsibly.
