# Contributing to AiorWot

Thanks for your interest in contributing! 🎉

## How to Contribute

### 1. Fork & Clone
```bash
git clone https://github.com/princekadian/AiorWot.git
cd AiorWot
cp .env.example .env
# Add your API key(s) to .env
```

### 2. Run Locally
```bash
npm i -g vercel    # Install Vercel CLI
vercel dev         # Start dev server at localhost:3000
```

### 3. Make Changes
- **Frontend**: Edit files in `public/`
- **Backend**: Edit files in `api/`
- **Docs**: Edit files in `docs/`

### 4. Submit a Pull Request
1. Create a new branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "Add your feature"`
3. Push: `git push origin feature/your-feature`
4. Open a Pull Request on GitHub

## Guidelines

- **Keep it simple** — This project values simplicity
- **Test your changes** — Make sure detection and humanizing still work
- **No unnecessary dependencies** — We aim for zero npm dependencies
- **Write clear commit messages**

## Ideas for Contributions

- 🌍 Add more API providers (Anthropic, Mistral, etc.)
- 🎯 Improve detection accuracy with better prompts
- 🌐 Add multi-language support
- 📱 Improve mobile responsiveness
- 🧪 Add automated tests
- 📊 Add text statistics (word count, readability score)
- 🐳 Add Docker support for self-hosting
- ♿ Improve accessibility

## Code Style

- Use vanilla HTML/CSS/JS (no frameworks for frontend)
- Use `const`/`let`, never `var`
- Use descriptive variable names
- Comment complex logic

## Questions?

Open an issue on GitHub — we're happy to help!
