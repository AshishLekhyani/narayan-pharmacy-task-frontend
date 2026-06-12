# Narayan Pharmacy — Frontend

Pharmacist-facing web app for prescription entry, AI drug-interaction screening, and prescription history. Built for **Narayan Pharmacy** (US dispensing context).

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Data fetching | TanStack Query (`@tanstack/react-query`) |
| Styling | Tailwind CSS v4 + design tokens in `globals.css` |
| Icons | `lucide-react` |
| Motion | `framer-motion` |
| Smooth scroll | `lenis` (client-only via `dynamic` import) |

## Features

- **Prescription entry** — patient name, date, medication list with modal add/edit (batch entry supported)
- **Clinical analysis**
  - **1 medication** → local rules-engine review (no API call)
  - **2+ medications** → Claude AI interaction check via backend (with DB cache badge on repeat combos)
- **Save to history** — persists prescription + AI metadata after successful analysis
- **Prescription history** — server-side pagination (10/page), debounced search, severity filters, CSV export
- **Severity tiers** — Mild / Moderate / Severe badges on history rows with expandable AI detail panels
- **Session draft** — form state survives in-tab navigation via `sessionStorage` (cleared on save)

## Prerequisites

- Node.js 20+
- Backend API running (see [`../Backend/README.md`](../Backend/README.md))

## Local development

```bash
# Terminal 1 — backend (port 5000)
cd ../Backend
npm install
cp .env.example .env   # configure DATABASE_URL
npm run db:generate
npm run db:migrate
npm run dev

# Terminal 2 — frontend (port 3000)
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

API calls from the browser go to `/api/*`. Next.js rewrites those requests to the Express backend (default `http://localhost:5000`).

## Environment variables

Copy `.env.example` to `.env.local` for overrides:

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_INTERNAL_URL` | Production only | Full URL of the deployed backend (e.g. `https://your-api.onrender.com`). Defaults to `http://localhost:5000` in dev. |

No Anthropic API key is needed in the frontend — AI calls are proxied to the backend.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run verify:secrets` | Scan source for hardcoded keys/URLs |

## Project structure

```
src/
├── app/
│   ├── page.tsx           # Prescription entry + analyze + save
│   ├── history/page.tsx   # Paginated history, filters, export
│   ├── layout.tsx         # Shell + navigation
│   └── Providers.tsx      # QueryClient + Lenis
├── components/
│   ├── Navigation.tsx
│   ├── PortalDropdown.tsx
│   └── SmoothScroll.tsx
├── hooks/
│   ├── use-session-draft.ts
│   └── use-debounced-value.ts
├── lib/
│   ├── analyze-and-save-api.ts  # Atomic analyze + save
│   ├── history-api.ts     # History fetch/export/delete
│   ├── api-error.ts       # fetchJson + error messages
│   ├── clinical-severity.ts
│   ├── format-date.ts
│   └── session-draft.ts
└── types/
    └── prescription.ts
```

## API integration

All server communication uses relative `/api` paths:

| Client helper | Backend route | Purpose |
|---------------|---------------|---------|
| `requestAnalyzeAndSavePrescription()` | `POST /api/prescriptions/analyze-and-save` | Analyze + save in one step |
| `fetchHistoryPage()` | `GET /api/history` | Paginated list with search/filter |
| `deleteHistoryRecords()` | `DELETE /api/history/batch` | Batch delete selected records |

Responses are normalized before render — raw JSON from Claude is never shown in the UI.

## Production deployment

Deploy as a standalone Next.js service (Vercel, Render, Railway, etc.).

1. Set `BACKEND_INTERNAL_URL` to your live backend URL.
2. Ensure the backend has `FRONTEND_URL` set to this app's public origin (CORS).
3. Build and start:

```bash
npm run build
npm start
```

### Pre-launch checklist

- [ ] Backend health returns `database: connected`
- [ ] History page loads records
- [ ] Analyze works with 2+ drugs (backend `ANTHROPIC_API_KEY` set)
- [ ] Save → record appears in history
- [ ] `npm run verify:secrets` passes

## Security

- `.env*` files are gitignored (`.env.example` is committed as a template).
- Run `npm run verify:secrets` before pushing.
- No API keys or database URLs belong in frontend source.

## Related docs

- [`AGENTS.md`](./AGENTS.md) — AI agent operational rules
- [`MEMORY.md`](./MEMORY.md) — chronological development log
