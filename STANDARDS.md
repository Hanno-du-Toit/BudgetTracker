# BudgetTracker — Project Standards

## Code Quality

- Write clean, readable code. Add comments only where the *why* is non-obvious (complex logic, workarounds, non-intuitive invariants).
- **Naming:** `camelCase` for variables and functions, `PascalCase` for React components and TypeScript types/interfaces, `SCREAMING_SNAKE_CASE` for constants.
- **Single responsibility:** each component does one thing. If a component is growing large, split it.
- No hardcoded values in component or logic code — extract to `src/constants/` or a config file.

## UI/UX

- **Mobile-first:** design and build for small screens first, then layer on responsive breakpoints for tablet and desktop.
- **Animations:** apply smooth transitions on all interactions — page changes, button clicks, modal open/close, list item entry/exit. Use consistent duration and easing (define them as CSS/JS constants).
- **Loading states:** every async action (data fetch, file parse, form submit) must show a loading indicator. The user should never wonder if something is happening.
- **Error messages:** surface friendly, plain-language messages to the user. Never show raw error objects, stack traces, or technical codes.
- **Empty states:** when a list or view has no data, show a helpful illustration or message that explains what belongs there and how to add it — never a blank screen.

## Performance

- Lazy-load routes/pages using React's `React.lazy` + `Suspense`.
- Avoid unnecessary re-renders: use `React.memo`, `useMemo`, and `useCallback` where profiling justifies it — not by default everywhere.

## Security

- **Bank statement parsing is client-side only.** Files are read and parsed entirely in the browser. No file content, raw statement data, or parsed transactions are ever sent to a server or third-party service.
- All Supabase tables must have **Row Level Security (RLS) enabled** with policies that restrict each user to their own data.
- Never log sensitive financial data (amounts, account numbers, merchant names) to the console or any external logging service.
- Secrets (Supabase URL, anon key) live in environment variables only — never committed to the repo.
