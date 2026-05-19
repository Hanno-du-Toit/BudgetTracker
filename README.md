# 💰 BudgetTracker

> Personal budget tracker for South Africans with AI-powered categorization coming soon. Drag and drop your bank statement and instantly see where your money goes — no data ever leaves your browser.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-budget--tracker--murex--psi.vercel.app-7c5cfc?style=for-the-badge&logo=vercel)](https://budget-tracker-murex-psi.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## Features

- **CSV bank statement parsing** — drag and drop your exported CSV and get instant insights
- **South African bank support** — FNB, ABSA, Capitec, Standard Bank, Nedbank, Discovery
- **Spending dashboard** — charts, category breakdowns, monthly summaries
- **Category management** — edit categories inline; your corrections are remembered
- **AI categorization ready** — Claude API integration for automatic smart categorization (coming soon)
- **Privacy first** — your bank data is parsed entirely in the browser and never sent to any server
- **Mobile friendly** — responsive design with a native-feel bottom navigation bar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS, Framer Motion |
| Backend / Auth | Supabase (PostgreSQL + Row Level Security) |
| Email | Brevo (transactional email for auth flows) |
| AI | Claude API — Anthropic (coming soon) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Brevo](https://brevo.com) account (optional — for custom email templates)

### 1. Clone and install

```bash
git clone https://github.com/Hanno-du-Toit/BudgetTracker.git
cd BudgetTracker
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLAUDE_API_KEY=your-claude-api-key   # optional, for AI categorization
```

### 3. Run the database migrations

In your Supabase SQL editor, run the SQL migration blocks provided in the project's CLAUDE.md file.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## Security

**Your bank data never leaves your browser.**

CSV files are parsed entirely on the client using JavaScript. The raw file content is never uploaded to any server, logged, or stored in any cloud service. Only the structured transaction data (date, description, amount, category) is saved to your private Supabase database, which is protected by Row Level Security — only your authenticated account can read or write your data.

---

## Deployment

This app is designed for one-click deployment on Vercel. The included `vercel.json` handles SPA routing automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hanno-du-Toit/BudgetTracker)

Set the three environment variables in Vercel's project settings, and you're live.

---

## License

MIT