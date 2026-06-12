<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:rules.md -->
## CLAUDE-INNOVATION-OS AGENT RULES

**Purpose**: Operational standards for agents working on the Narayan Pharmacy frontend. Agents must behave as strategic partners, responsible executors, and continuous documentarians.

---

### 1. ROLE & BEHAVIOR
- **Strategic partner**: Challenge ambiguous prompts; propose options when requirements conflict.
- **Responsible executor**: Prioritize security, accessibility, clinical data integrity, and maintainability.
- **Truth-seeker**: Verify claims against the running app and backend contract before declaring completion.

### 2. MANDATORY MEMORY GOVERNANCE
- **Always read `AGENTS.md` and `MEMORY.md` before coding.**
- **Always append to `MEMORY.md` after meaningful changes** with an accurate local timestamp, the *why*, and verification results.
- Treat `MEMORY.md` as the project's live state tracker — never leave it stale after a session.

### 3. PROJECT GUARDRAILS (Narayan Pharmacy Frontend)

#### Business Context
Custom-built for **Narayan Pharmacy** (US pharmacy operations). Preserve pharmacist-grade terminology, high data density, and US SIG conventions (QD, BID, TID, QID, PRN, QHS).

#### Tech Stack (strict)
| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Async data | `@tanstack/react-query` for **all** server interactions |
| Styling | Tailwind v4 (`@theme`) + CSS `clamp()` — no legacy Material Icons |
| Icons | `lucide-react` only |
| Motion | `framer-motion` for state transitions |
| Scrolling | `lenis` via `Providers.tsx` — mount only after client hydration |

#### Backend Contract
- API is proxied: `/api/*` → `http://localhost:5000/api/*` (`next.config.ts` rewrites).
- Canonical entities: `PrescriptionRecord` + `PrescriptionItem`. UI may say "history" / "medications" but must not reintroduce misleading `Prescription` child-table naming.
- Save payload: `{ patientName, date, medications[], aiAnalysis }`.
- Analyze requires **≥ 2 medications**; backend returns `{ status, message }` on errors.

#### Clinical Safety Rules
- **Analysis freshness**: Any add/edit/remove of medications after a successful AI analysis must invalidate (`analyzeMutation.reset()`) before save.
- **No placeholder analytics**: History stats, filters, CSV export must use live query data.
- **Minimum interaction check**: Disable analyze when `drugs.length < 1`; single-drug rules engine runs server-side via analyze-and-save.
- **No raw JSON in UI**: Always normalize analyze-and-save responses through `src/lib/analyze-and-save-api.ts` (Zod) before rendering.
- **Graceful analyze failures**: Show inline error + Retry button; never clear form state on analyze error.

#### Hydration Safety (critical)
Never cause SSR/client text mismatches:
- Do **not** read `sessionStorage` or `window` inside `useState` initializers.
- Hydrate persisted draft via `useSessionDraft()` (`src/hooks/use-session-draft.ts` + `useSyncExternalStore`).
- Do **not** use `toLocaleString()` without a fixed locale/timezone — use `src/lib/format-date.ts`.
- Do **not** use `Date.now()` / `Math.random()` in render output.
- Mount `ReactLenis` only after `isMounted` in `Providers.tsx`.

#### Session Draft Persistence
- Keys: `rx_patientName`, `rx_date`, `rx_drugs` in `sessionStorage`.
- Survives in-tab navigation; cleared on successful save via `clearDraftSession()`.
- Invalidate `["history"]` query after save so History page refetches.

### 4. FILE MAP
| Path | Responsibility |
|------|----------------|
| `src/app/page.tsx` | Prescription entry, modal workflow, analyze + save |
| `src/app/history/page.tsx` | Live history table, search, filters, CSV export |
| `src/app/Providers.tsx` | React Query + Lenis (client-only) |
| `src/components/Navigation.tsx` | Active route highlighting |
| `src/lib/analyze-and-save-api.ts` | Atomic analyze + save fetch and Zod validation |
| `src/lib/format-date.ts` | SSR-safe date formatting |
| `src/hooks/use-session-draft.ts` | `useSyncExternalStore` hook for draft state |
| `src/lib/session-draft.ts` | Session draft read/write/clear helpers |
| `src/components/SmoothScroll.tsx` | Client-only Lenis wrapper |
| `src/types/prescription.ts` | Shared Medication / AnalysisResult types |

### 5. EXECUTION WORKFLOW
1. Read `MEMORY.md` + `AGENTS.md`.
2. Confirm backend is running on port 5000.
3. Implement with minimal, focused diffs matching existing conventions.
4. Run `npm run lint` and `npm run build`.
5. Append milestone to `MEMORY.md` with verification checklist.

### 6. SECURITY RED FLAGS (must never exist)
- **No hardcoded API keys** — secrets live only in `Backend/.env` (gitignored). Run `npm run verify:secrets` before commit.
- **No raw Claude JSON in UI** — analyze-and-save responses pass through Zod in `analyze-and-save-api.ts`; render only typed clinical fields.
- **No unhandled API calls** — use `fetchJson()` / `requestAnalyzeAndSavePrescription()`; surface `message` strings inline, never `alert()` or raw response bodies.

### 7. VERIFICATION CHECKLIST (run before declaring done)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No hydration warnings in browser console on `/` and `/history`
- [ ] Save flow persists to Neon and appears on History without manual refresh
- [ ] Analyze button disabled with < 2 drugs; shows server error message when API key missing
- [ ] Medication edits after analysis reset the analysis state
- [ ] `MEMORY.md` updated with timestamp

---

**End of Agent Rules**
<!-- END:rules.md -->
