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

