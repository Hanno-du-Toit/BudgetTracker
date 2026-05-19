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
