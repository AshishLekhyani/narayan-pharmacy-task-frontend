# Architectural Memory & Development Progression

> [!NOTE]
> **AI Context & Evaluator Guide**
> This file serves as a chronological timeline of the project's development. It documents the deliberate prompting strategy, architectural trade-offs, and progression of thinking. **AI Agents MUST append new milestones chronologically at every step.**

## Phase 1: Frontend Foundation & Orchestration

### [June 10, 2026] Initial Strategic Prompting & Architecture Selection
*The objective was to build a clinical-grade "Prescription Entry & Drug Interaction Checker" customized for **Narayan Pharmacy**.*
- **Deliberate Prompting**: The project was initialized by mandating the AI to strictly inherit a design foundation from **Stitch (Google's AI design tool)**, rejecting any generic React templates.
- **Architectural Trade-Off**: Adopted **Next.js App Router** over Vite. While Vite offered faster local HMR, Next.js was chosen for superior layout nesting and its ability to seamlessly mock the backend API routes before integrating the Python backend.

### [June 10, 2026] Typography & State Management Overhaul
- **Fluid Typography**: Solved mobile overflow issues by replacing rigid Tailwind classes with a bespoke design system utilizing CSS `clamp()`. This trade-off prioritized perfect responsiveness while maintaining structural fidelity.
- **State Management**: Migrated away from native `useEffect` toward `@tanstack/react-query`. This completely eliminated flaky `setTimeout` mocks, providing robust `isPending` states essential for clinical applications.

### [June 10, 2026] Premium Micro-Interactions Integration
- **Trade-Off**: Decided against standard CSS transitions in favor of integrating `framer-motion` alongside `@studio-freight/react-lenis` to elevate the UI into a premium, corporate-grade product with staggered reveals.

### [June 10, 2026] Course Corrections: Styling & Audience Realignment
- **Styling Conflict**: Injected the legacy `tailwind.config.ts` directly into the Next.js Tailwind v4 setup using the `@config` directive to resolve mapping failures from the Stitch prototypes.
- **Clinical Audience Re-Pivot**: After a brief "client-facing" shift, the project was decisively reverted back to a **Pharmacist-Only** clinical interface to ensure medical terminology remains dense and accurate.

## Phase 2: Refinement & Simplification

### [June 11, 2026 - 3:27 PM] Documentation Standardization (Evaluator Rubric)
- Completely rewrote `CLAUDE.md`, `AGENTS.md`, and this `MEMORY.md` file to strictly adhere to the professional evaluator rubric.
- Injected strict AI behavioral protocols into `AGENTS.md` to force continuous documentation updates.

### [June 11, 2026 - 3:30 PM] UI Simplification & Rebranding
- **Action**: Removed the redundant lateral navigation (sidebar) and unnecessary account/settings header icons. Reclaimed horizontal space by removing the `md:ml-64` margin.
- **Rebranding**: Officially updated the HTML title and navigation headers strictly to "Narayan Pharmacy".
### [June 11, 2026 - 4:05 PM] Environment Fixes
- **Bug Fix**: Added `"type": "module"` to `package.json` to eliminate Node.js ECMA parsing warnings caused by Tailwind v4. Restored `@config` to ensure design tokens render properly.

### [June 11, 2026 - 4:15 PM] Navigation Context Refinement
- **Action**: Removed the global search bar from the top navigation as it did not make contextual sense for a single-prescription entry flow.
- **Clarity**: Renamed generic navigation terms ("Dashboard" and "Patients") to precise, intent-driven labels ("Prescription Entry" and "Prescription History").

### [June 11, 2026 - 4:50 PM] Modal Workflow & Active Navigation States
- **Feature Implementation**: Built a robust `framer-motion` modal overlay for Adding and Editing medications. This replaced the clunky inline table inputs, providing a much cleaner, professional data-entry pattern.
- **Iteration (Batching)**: Enhanced the modal's internal state to support batch-adding. Pharmacists can now click "Add Another Medication" within the modal to append multiple rows of data in a single rapid-entry flow.
- **Iteration (Data Structuring)**: Separated the combined "Dosage / Frequency" string into explicit `dosage` and `frequency` variables. Updated both the table columns and modal inputs to reflect this higher-fidelity data structure.
- **Iteration (Guided Input)**: Replaced the free-text Frequency input with a native HTML Dropdown (OD, BD, TDS, etc.). Included a "Custom..." fallback option that smoothly animates a guided text input into view when selected. Utilizing native select eliminates edge-case scroll-chaining and stacking-context/clipping bugs inside the modal.
- **Scroll Lock**: Enforced global CSS scroll-locking on the `html` and `body` tags when the modal is open to prevent underlying Next.js layouts from scroll-bleeding.
- **Navigation Fix**: Extracted the header navigation into a `<Navigation />` Client Component using `usePathname()` to dynamically highlight the currently active page route, fixing the active state visual bug.
### [June 11, 2026 - 5:35 PM] History Data Structure Refinement
- **History Data Structure**: Restructured `history/page.tsx` to utilize realistic array data for medications (`drugs[]`). Replaced the "Prescribing Physician" view in the expanded accordion row with a clean, tabular view of the entered prescription details, adhering to the established design system tokens.

### [June 11, 2026 - 7:20 PM] Backend Contract Alignment & History Screen Hardening
- **Contract Realignment**: Updated the integrated frontend flow to save `medications[]` instead of overloading `prescriptions[]`, aligning the UI language with the corrected backend schema (`PrescriptionRecord` + `PrescriptionItem`).
- **Clinical Safety Fix**: Added analysis invalidation whenever the medication list changes after a completed AI check. This prevents a stale interaction result from being saved against a modified prescription.
- **Entry Flow Tightening**: Strengthened modal validation so a medication row now requires name, dosage, and a valid frequency before it can be committed. Added a proper empty state for the medication table and blocked analysis when no medications exist.
- **History Screen Upgrade**: Replaced hardcoded dashboard metrics with live calculated values from backend data, added working patient/medication search, added a practical severity filter, and implemented CSV export from the visible dataset.
- **Cleanup**: Removed leftover Material Symbols imports and unused layout imports to keep the UI code aligned with the established `lucide-react` standard.
- **Validation Result**: `npm run lint` now passes in `Frontend`. Full `next build` and standalone `tsc --noEmit` remain blocked by locked stale `.next` artifacts in this workspace, not by current source lint failures.

### [June 11, 2026 - 7:45 PM] Proxy Orchestration & Live Data Integration
- **API Proxy**: Implemented Next.js `rewrites` in `next.config.ts` to cleanly proxy all frontend `/api/*` calls to the standalone Express backend on port 5000, avoiding complex CORS configurations.
- **Data Hydration**: Refactored `history/page.tsx` from static mock data to live PostgreSQL data utilizing `@tanstack/react-query`, correctly mapping the flattened Prisma response columns back to the rich UI nested data architecture.

### [June 11, 2026 - 8:13 PM] Form Persistence, UX Hardening & Clinical Safety Guardrails
- **Session Persistence**: Replaced raw `useState` for `patientName`, `date`, and `drugs` with `sessionStorage`-backed lazy initializers. State survives tab switches and navigation within the same browser session but is automatically cleared when the tab is closed. All three keys (`rx_patientName`, `rx_date`, `rx_drugs`) are cleared on successful save.
- **History Auto-Refetch**: Wired `useQueryClient` into the save mutation's `onSuccess` callback. Calling `queryClient.invalidateQueries({ queryKey: ["history"] })` causes the History page cache to be marked stale immediately after a prescription is saved, so no manual navigation is needed to see the new record.
- **Single-Drug Analysis Guard**: Changed the `disabled` condition on the Analyze button from `drugs.length === 0` to `drugs.length < 2`. Drug interaction analysis requires at least two concurrent medications; a single drug has no pair to interact with. A helper label appears below the button explaining the minimum requirement.
- **Inline Error UI**: The analyze result placeholder panel now shows a distinct error state (red AlertTriangle icon + the server's actual error message) when the mutation fails. Previously the error was only logged to the console.
- **Real Error Messages**: The `analyzeMutation.mutationFn` now parses the JSON error body returned by the backend and surfaces its `message` field, replacing the generic `"Failed to analyze"` fallback.

### [June 11, 2026 - 8:45 PM] Hydration Repair, Draft Persistence Hardening & Agent Docs
- **Hydration Root Cause**: `sessionStorage` reads inside `useState` initializers caused SSR/client text mismatches. Replaced with `useSyncExternalStore` via `src/hooks/use-session-draft.ts` backed by `src/lib/session-draft.ts` (React-recommended external store pattern).
- **Date Safety**: Centralized `todayIsoDate()` and `formatPrescribedAt()` in `src/lib/format-date.ts`; History table no longer uses locale-dependent `toLocaleString()`.
- **Lenis Guard**: `SmoothScroll.tsx` loaded via `dynamic(..., { ssr: false })` in `Providers.tsx` to prevent scroll-wrapper DOM drift during hydration.
- **Shared Types**: Extracted `Medication` and `AnalysisResult` to `src/types/prescription.ts` for reuse across entry and history flows.
- **UX Polish**: Replaced `alert()` on save with dismissible inline success/error notices. Wired `Print Report` to `window.print()`. Analyze requests now strip client-only `id` fields before POST.
- **AGENTS.md Enhancement**: Expanded with file map, hydration rules, verification checklist, and mandatory `MEMORY.md` update protocol.
- **CLAUDE.md Correction**: Removed stale references to Python backend and non-existent `src/app/api/analyze/route.ts`; documented dual-server dev workflow.
- **Validation Result**: `npm run build` passes. `npm run lint` passes.

### [June 12, 2026 - 10:45 AM] Claude API UX Compliance Audit
- **Analysis API Client**: Centralized fetch + response normalization in `src/lib/analysis-api.ts`. Raw JSON is parsed server-side and validated into typed clinical fields before any UI render — no JSON blobs shown to pharmacists.
- **Error Resilience**: Network failures, unreadable responses, and server `message` errors surface inline with a **Retry Analysis** button. Form state (patient, drugs, date) is never cleared on analyze failure.
- **Loading State**: Analyze button shows spinner + "Analyzing with Claude..."; results panel shows animated loading copy while `isPending`.
- **Cache Transparency**: When backend serves a DB cache hit, UI shows a human-readable "Retrieved from cache" badge — not raw `cachedResult` JSON.
- **Save Hardening**: Save mutation now handles network/unreadable errors gracefully and strips UI-only fields from `aiAnalysis` before POST.
- **History Errors**: History query shows server/network error messages inline instead of a generic failure string.
- **Validation Result**: `npm run lint` and `npm run build` pass.

### [June 12, 2026 - 11:30 AM] History Performance, Pagination, Filters & Single-Drug Workflow
- **Server-Side History**: Migrated history list to paginated API (`page`, `limit=10`, `search`, `filter`) with debounced search (300ms) and `placeholderData` for instant filter/page transitions.
- **PortalDropdown**: Replaced native `<select>` filter with portal-based dropdown matching prescription entry UX.
- **Working Pagination**: Prev/next + numbered page buttons driven by API `meta.totalPages`; shows `X–Y of Z matching records`.
- **Single-Drug Flow**: `requestPrescriptionAnalysis()` returns local rules-engine result for 1 medication (no Claude call); 2+ drugs use Claude with DB cache badge.
- **CSV Export**: Fetches all matching filtered rows in chunks (up to 500) for export.
- **Validation Result**: `npm run lint` and `npm run build` pass.

### [June 12, 2026 - 12:00 PM] History Detail Severity Tiers & Interaction Panel
- **Severity Tiers**: Added `clinical-severity.ts` mapping stored AI labels to **Mild / Moderate / Severe** badges on the history table.
- **Detail View**: Expanded row now shows full AI interaction result — interaction status, primary warning, recommendation, clinical impact, and tier-coloured panels (not always red).
- **CSV**: Export includes clinical severity tier column.

### [June 12, 2026 - 12:15 PM] Security Red-Flag Audit
- **Secrets**: Confirmed `.env` is gitignored; added `npm run verify:secrets` scanner. No hardcoded API keys in source.
- **No Raw JSON in UI**: Centralized `fetchJson()` + stricter `normalizeAnalysisResult()`; save flow uses `savePrescription()` helper.
- **Error Handling**: Removed `alert()` on CSV export; all API paths surface human-readable `message` strings inline.

### [June 12, 2026 - 2:00 PM] Deployment Readiness & Documentation
- **Production Proxy**: `next.config.ts` now reads `BACKEND_INTERNAL_URL` (defaults to `http://localhost:5000`) so deployed Next.js can proxy `/api/*` to the live Express backend without code changes.
- **Env Template**: Added `Frontend/.env.example`; updated `.gitignore` with `!.env.example` so the template can be committed.
- **README**: Replaced default `create-next-app` README with project-specific setup, env vars, feature overview, and production deploy instructions.
- **Final Audit**: `npm run build`, `npm run lint`, and `npm run verify:secrets` all pass. History severity tiers and expanded AI detail panel verified; prior `severityColor` runtime error resolved in current source.
- **Validation Result**: Production build succeeds; app ready for deployment once backend `BACKEND_INTERNAL_URL` and backend `ANTHROPIC_API_KEY` are configured.

### [June 12, 2026 - 4:30 PM] Auto-Save Workflow, Batch Delete & Cache Hardening
- **Root Cause (missing history)**: Analyze previously did not persist to the DB — users had to click a separate Save button after scanning. Many users only ran analysis and never saved.
- **Auto-Save**: Prescription entry now runs analyze → save in one step. Patient name (≥2 chars) is required before the action. Success notice confirms history write and cache hits.
- **Batch Delete**: Added `DELETE /api/history/batch` and history page checkboxes with “Delete Selected (N)” for bulk removal.
- **Cache Reliability**: Analyze route now `await`s `analysisCache.upsert()` instead of fire-and-forget `create`, preventing silent cache misses on Neon.
- **Validation Result**: `npm run build` and `npm run lint` pass in both repos.

### [June 12, 2026 - 5:15 PM] Persisted Analysis Results & Clinical Input Validation
- **Persisted Results**: Last analysis + prescription snapshot stored in `sessionStorage` (`rx_lastAnalysis`) via `use-persisted-analysis` — survives navigation to History and back in the same tab.
- **Start New Prescription**: Clears draft, persisted analysis, and mutation state when pharmacist is done reviewing.
- **Input Validation**: `prescription-validation.ts` blocks junk patient names, drug names, dosages (e.g. `10mg`), and frequencies on modal save and before analyze/save; inline errors on patient field and modal.
- **Invalidation**: Editing patient, date, or drugs after analysis clears stale persisted results.

### [June 12, 2026 - 5:30 PM] Unrecognized Drug Severity Mapping
- **Clinical Severity**: `clinical-severity.ts` maps backend label `Drug Identification Required` to **Moderate** tier so fictional/unknown drug responses surface clearly in history without pretending to be a verified safe interaction.

### [June 12, 2026 - 6:00 PM] Architecture & Code Quality Refactor
- **Component Extraction**: `page.tsx` slimmed (~876 → ~560 lines) — `AnalysisResultPanel`, `InlineNotice`, shared `PortalDropdown` for frequency (removed duplicate `FrequencyDropdown`).
- **Hooks**: `use-analyze-and-save.ts` (analyze + save mutation), `use-scroll-lock.ts` (modal body lock).
- **Shared Constants**: `frequency-presets.ts` centralizes OD/BD/TDS presets for modal and edit flow.
- **UX**: Removed duplicate “AI Recommendation” block in results; entry page now uses `clinical-severity.ts` tier styling in `AnalysisResultPanel`.
- **Validation Parity**: Frontend junk blocklist now includes `null` and `undefined` (matches backend).
- **Validation Result**: `npm run build` passes.

### [June 12, 2026 - 7:15 PM] Second-Pass Quality & Safety Hardening
- **Clinical Safety**: Changing patient, date, or drugs now clears both persisted analysis and in-memory mutation results (no stale analysis panel).
- **Validation**: Zod parsing for analyze API, session draft drugs, and persisted analysis; inline prescription date errors.
- **Limits**: 50-medication cap enforced in UI; batch delete capped at 100; export truncation notice at 500 rows.
- **History UX**: Selection cleared on filter/search/page change; mobile nav visible (Entry / History).
- **A11y**: `InlineNotice` uses `role="alert"` / `aria-live`; print CSS hides chrome and form (`no-print`).
- **Shared Constants**: `clinical-constants.ts`, `history-filters.ts`, `createMedicationId()` via `crypto.randomUUID`.
- **Validation Result**: `npm run build` and `npm run lint` pass.

### [June 12, 2026 - 6:45 PM] History Split, Modal Extract & API Schemas
- **History Page**: Split into `HistoryStatsCards`, `HistoryToolbar`, `HistoryTable`, `HistoryRecordRow`, `HistoryExpandedDetail`, `HistoryPagination`; page ~633 → ~200 lines.
- **Delete UX**: Replaced `window.confirm` with accessible `ConfirmDialog`.
- **Medication Modal**: Extracted `MedicationFormModal` from entry page; `page.tsx` further reduced.
- **Zod API Parsing**: `history-schemas.ts` validates list, stats, and batch-delete responses; added `zod` dependency.
- **Stats Query**: History stats fetched via `GET /api/history/stats` (cached 60s) instead of bundled on every paginated list request.
- **CSV**: Moved to `history-csv.ts`.
- **Validation Result**: `npm run build` passes.

### [June 12, 2026 - 8:15 PM] Modal A11y, Atomic Save & Drug Table Extract (#2, #4, #5)
- **Modal A11y (#2)**: `use-focus-trap.ts` (Tab cycle, Escape, focus restore); shared `ModalShell` with scroll lock; `ConfirmDialog` and `MedicationFormModal` wired through shell with `aria-label` / `htmlFor` / `role="alert"`; `PortalDropdown` gains listbox keyboard nav (Arrow/Home/End/Enter/Escape) and `aria-haspopup` / `aria-expanded`.
- **Atomic Save (#4)**: `analyze-and-save-api.ts` + `use-analyze-and-save.ts` call `POST /api/prescriptions/analyze-and-save` instead of separate analyze then save.
- **Component Extract (#5)**: `DrugListTable` and `PrescriptionActionBar` extracted from `page.tsx` (~420 lines remaining).
- **Validation Result**: `npm run build` and `npm run lint` pass.

### [June 12, 2026 - 9:30 PM] Audit Remediation — Clinical Safety & A11y Fixes
- **Stale Persist Race**: `onSuccess` uses mutation variables + fingerprint check; ignores results if prescription changed during in-flight request.
- **Portal Dropdown in Modals**: `stopPropagation` on Escape; listbox focused on open; `data-focus-trap-exempt` + `data-portal-dropdown-open` integrate with focus trap.
- **Focus Trap**: Stable `onEscape` ref; exempt portaled menus in Tab order; `initialFocusRef` on medication form (first field) and destructive confirm (Cancel).
- **Stable Callbacks**: `useCallback` for modal close handlers on entry and history pages.
- **Cleanup**: Removed dead `analysis-api.ts`, `savePrescription()`, and unused `analyzeApiResponseSchema`; updated README/AGENTS.md.
- **Validation Result**: `npm run build` and `npm run lint` pass.
- **Zod parity**: `analysis-schemas.ts` enforces `severity` enum and `clinicalImpact` min 2, matching backend normalization output.
