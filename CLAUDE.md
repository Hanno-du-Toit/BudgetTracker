# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BudgetTracker — a production budget tracking web app used daily by real users. React 18, Vite, Tailwind CSS, Supabase, Framer Motion. Deployed on Vercel.

## Standards

All development must follow **STANDARDS.md** in the project root. Key points:
- Mobile-first UI, smooth animations, loading states, friendly errors, and non-empty empty states on every view.
- Bank statement files are parsed client-side only — never sent to any server.
- Supabase RLS enabled on every table.
- No hardcoded values; use `src/constants/` or config files.
- Use Tailwind responsive prefixes (`sm:`, `md:`) for layout changes — never break desktop when fixing mobile.

## How to Operate

1. **Check existing components first** — before building anything new, check `src/components/` and `src/hooks/` to see if something already exists. Reuse and extend rather than duplicate.

2. **When things fail** — read the full error, fix it, verify it works, then move on. Don't leave broken code or workarounds behind.

3. **Keep changes focused** — only touch files directly related to the task. Don't refactor unrelated code while fixing something else.

4. **Verify before committing** — make sure the change works before committing. Don't commit broken code.

5. **Learn and document** — when you discover API quirks, Supabase constraints, or unexpected behavior, note it so it doesn't happen again.

## Architecture

- `src/components/` — reusable UI components organised by feature folder
- `src/hooks/` — data fetching and business logic (useTransactions, useFileParser, useDashboardStats)
- `src/services/` — external services (Supabase, CSV parser, categorization)
- `src/constants/` — categories, limits, routes
- `src/pages/` — top-level route components
- `src/utils/` — pure utility functions (column detection, normalizer)

## Key Decisions

- Categorization uses a 3-tier system: user overrides → rule-based keywords → Claude AI
- Internal transfers are detected via saved account numbers in `user_accounts` table
- Bank detection happens from CSV headers in `columnDetector.js`
- All charts use Recharts; animations use Framer Motion
