# Project Overview
**Narayan Pharmacy - Clinical Prescription Validation System**

A clinical-grade web application for **Narayan Pharmacy** that modernizes prescription entry and runs AI-driven drug interaction checks via a standalone Express backend.

## Tech Stack & Project Structure
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with a custom "Clinical Precision" design system (`clamp()` fluid typography)
- **State Management**: `@tanstack/react-query` for all async server interactions
- **Motion & Scrolling**: `framer-motion` + `lenis` (client-only, see `Providers.tsx`)
- **Backend**: Express 5 + Prisma + Neon PostgreSQL (separate `Backend/` folder, port 5000)
- **AI**: Anthropic Claude via `POST /api/analyze` (proxied from frontend)

### Key Files
| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Prescription entry, modal workflow, analyze + save |
| `src/app/history/page.tsx` | Live history with search, filters, CSV export |
| `src/app/Providers.tsx` | React Query + Lenis wrapper |
| `src/components/Navigation.tsx` | Route-aware nav links |
| `src/lib/format-date.ts` | SSR-safe date formatting |
| `src/lib/session-draft.ts` | Session draft persistence |
| `next.config.ts` | Proxies `/api/*` → `http://localhost:5000/api/*` |

## How to Run Locally
1. **Backend** (terminal 1):
   ```bash
   cd Backend && npm install && npm run db:generate && npm run dev
   ```
2. **Frontend** (terminal 2):
   ```bash
   cd Frontend && npm install && npm run dev
   ```
3. Open http://localhost:3000

> [!NOTE]
> **AI Agent Instructions**: Read `AGENTS.md` for operational rules and `MEMORY.md` for project history. Update `MEMORY.md` after every meaningful change.

## Key Conventions
- **Strict Typing**: Shared types in `src/types/prescription.ts`
- **Icons**: `lucide-react` only (no Material Icons)
- **Hydration safety**: Never read `sessionStorage` in `useState` initializers; hydrate in `useEffect`
- **Clinical safety**: Invalidate AI analysis when medications change after analysis completes

## Constraints & Gotchas
- **Dual-server dev**: Frontend alone is not enough — backend must run on port 5000 for API calls.
- **AI key optional locally**: Without `ANTHROPIC_API_KEY`, analyze returns 503 with a clear message.
- **Analyze minimum**: Requires at least 2 medications (enforced frontend + backend).
- **Build**: Run `npm run build` after config changes to verify production behavior.
