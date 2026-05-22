# 💰 BudgetTracker

> A premium personal budget tracker built for South Africans. Drag and drop your bank statement and instantly see where your money goes — beautifully visualised, private by design, and smart enough to learn your spending habits.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-budget--tracker--murex--psi.vercel.app-7c5cfc?style=for-the-badge&logo=vercel)](https://budget-tracker-murex-psi.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## Features

- **Multi-bank CSV parsing** — ABSA, FNB, Capitec, Standard Bank, Nedbank, Discovery — auto-detected on upload
- **Smart 3-tier categorization** — user overrides → SA keyword rules → Claude AI fallback
- **Internal transfer detection** — add your own account numbers and transfers between your accounts are automatically excluded from spending totals
- **Premium animated dashboard** — donut chart, weekly/monthly bar chart toggle, top spending categories with progress bars
- **Bank filter** — upload statements from multiple banks and filter the dashboard per bank
- **Investments category** — Easy Equities and ETF transactions automatically detected
- **Swipeable mobile charts** — Framer Motion carousel on mobile for smooth chart navigation
- **Category memory** — manually correct a category once and it's remembered forever for that merchant
- **My Accounts** — register your own account numbers so inter-account transfers are never counted as income or expenses
- **Premium UI** — animated gradient background, glassmorphism cards, floating pill navbar with 3D hover animations, spotlight effects on landing page
- **Privacy first** — your bank data is parsed entirely in the browser and never sent to any server
- **Mobile first** — responsive design with native-feel bottom navigation, compact stat cards, and swipeable charts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS, Framer Motion |
| Backend / Auth | Supabase (PostgreSQL + Row Level Security) |
| Email | Brevo (transactional email for auth flows) |
| AI | Claude API — Anthropic (rule-based + optional AI tier) |
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

In your Supabase SQL editor, run these SQL blocks in order:

```sql
-- Statements table
create table statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_type text default 'csv',
  bank_name text default 'Unknown',
  statement_month text not null,
  transaction_count integer default 0,
  uploaded_at timestamptz default now()
);
alter table statements enable row level security;
create policy "Users manage own statements" on statements for all using (auth.uid() = user_id);

-- Transactions table
create table transactions (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  statement_id uuid references statements(id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount numeric not null,
  category text not null default 'other',
  is_manually_categorized boolean default false,
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "Users manage own transactions" on transactions for all using (auth.uid() = user_id);

-- Category overrides
create table category_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description_pattern text not null,
  category text not null,
  created_at timestamptz default now(),
  unique(user_id, description_pattern)
);
alter table category_overrides enable row level security;
create policy "Users manage own overrides" on category_overrides for all using (auth.uid() = user_id);

-- User accounts (for internal transfer detection)
create table user_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_number text not null,
  account_name text not null,
  created_at timestamptz default now(),
  unique(user_id, account_number)
);
alter table user_accounts enable row level security;
create policy "Users manage own accounts" on user_accounts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant usage on schema public to anon, authenticated;
grant all on user_accounts to authenticated;
```

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

CSV files are parsed entirely on the client using JavaScript. The raw file content is never uploaded to any server, logged, or stored in any cloud service. Only the structured transaction data (date, description, amount, category) is saved to your private Supabase database, protected by Row Level Security — only your authenticated account can read or write your data.

---

## Deployment

One-click deployment on Vercel. The included `vercel.json` handles SPA routing automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hanno-du-Toit/BudgetTracker)

Set the environment variables in Vercel's project settings and you're live.

---

## License

MIT
