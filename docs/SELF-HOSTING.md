# Self-Hosting Guide

Run AiOrNot on your own machine or server.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **At least 1 API key** — See [API-PROVIDERS.md](API-PROVIDERS.md)

## Option 1: Using Vercel CLI (Easiest)

```bash
# Clone the repo
git clone https://github.com/princekadian/AiorWot.git
cd AiOrNot

# Setup environment
cp .env.example .env
# Edit .env and add your API key(s)

# Install Vercel CLI
npm i -g vercel

# Run
vercel dev
```

Open `http://localhost:3000`

## Option 2: Using Node.js directly

If you don't want to use Vercel CLI, you can use a simple Express wrapper:

```bash
# Clone the repo
git clone https://github.com/princekadian/AiorWot.git
cd AiOrNot

# Setup environment
cp .env.example .env
# Edit .env with your API key(s)

# Install a simple server
npm install express dotenv

# Create a simple server.js (see below)
```

Create `server.js`:
```javascript
require('dotenv').config();
const express = require('express');
const detect = require('./api/detect');
const humanize = require('./api/humanize');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/detect', detect);
app.post('/api/humanize', humanize);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AiOrNot running on http://localhost:${PORT}`));
```

Then run:
```bash
node server.js
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | At least one | Google Gemini API key |
| `GROQ_API_KEY` | At least one | Groq API key |
| `COHERE_API_KEY` | At least one | Cohere API key |
| `OPENROUTER_API_KEY` | At least one | OpenRouter API key |

You need **at least one** key configured. The app will automatically use whichever keys are available and fallback between them.
