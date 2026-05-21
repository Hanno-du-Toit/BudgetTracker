# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BudgetTracker — a production budget tracking web app used daily by real users. The codebase is at an early stage with no source files yet.

## Standards

All development must follow **STANDARDS.md** in the project root. Key points:
- Mobile-first UI, smooth animations, loading states, friendly errors, and non-empty empty states on every view.
- Bank statement files are parsed client-side only — never sent to any server.
- Supabase RLS enabled on every table.
- No hardcoded values; use `src/constants/` or config files.

## How to Operate

1. **Check existing components first** — before building anything new, check `src/components/` and `src/hooks/` to see if something already exists for that task. Reuse and extend rather than duplicate.

2. **When things fail** — read the full error, fix it, verify it works, then move on. Don't create workarounds that leave broken code behind.

3. **Keep changes focused** — only touch files directly related to the task. Don't refactor unrelated code while fixing something else.

4. **Verify before committing** — make sure the change works as expected before committing. Don't commit broken code.
