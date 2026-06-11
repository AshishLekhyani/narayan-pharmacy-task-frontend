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

### [June 11, 2026] Documentation Standardization (Evaluator Rubric)
- Completely rewrote `CLAUDE.md`, `AGENTS.md`, and this `MEMORY.md` file to strictly adhere to the professional evaluator rubric.
- Injected strict AI behavioral protocols into `AGENTS.md` to force continuous documentation updates.

### [June 11, 2026] UI Simplification & Rebranding
- **Action**: Removed the redundant lateral navigation (sidebar) and unnecessary account/settings header icons. Reclaimed horizontal space by removing the `md:ml-64` margin.
- **Rebranding**: Officially updated the HTML title and navigation headers strictly to "Narayan Pharmacy".
- **Bug Fix**: Added `"type": "module"` to `package.json` to eliminate Node.js ECMA parsing warnings caused by Tailwind v4.

### [June 11, 2026] Modal Workflow & Active Navigation States
- **Feature Implementation**: Built a robust `framer-motion` modal overlay for Adding and Editing medications. This replaced the clunky inline table inputs, providing a much cleaner, professional data-entry pattern.
- **Iteration (Batching)**: Enhanced the modal's internal state to support batch-adding. Pharmacists can now click "Add Another Medication" within the modal to append multiple rows of data in a single rapid-entry flow.
- **Iteration (Data Structuring)**: Separated the combined "Dosage / Frequency" string into explicit `dosage` and `frequency` variables. Updated both the table columns and modal inputs to reflect this higher-fidelity data structure.
- **Iteration (Guided Input)**: Replaced the free-text Frequency input with a native HTML Dropdown (OD, BD, TDS, etc.). Included a "Custom..." fallback option that smoothly animates a guided text input into view when selected. Utilizing native select eliminates edge-case scroll-chaining and stacking-context/clipping bugs inside the modal.
- **Scroll Lock**: Enforced global CSS scroll-locking on the `html` and `body` tags when the modal is open to prevent underlying Next.js layouts from scroll-bleeding.
- **Navigation Fix**: Extracted the header navigation into a `<Navigation />` Client Component using `usePathname()` to dynamically highlight the currently active page route, fixing the active state visual bug.

### [June 11, 2026] Navigation Context Refinement
- **Action**: Removed the global search bar from the top navigation as it did not make contextual sense for a single-prescription entry flow.
- **Clarity**: Renamed generic navigation terms ("Dashboard" and "Patients") to precise, intent-driven labels ("Prescription Entry" and "Prescription History").

---

## Pending Frontend Tasks
- **[PENDING]** Update the `fetch` call in `src/app/page.tsx` to point to the production Python backend URL once it is available.
- **[PENDING]** Handle potential timeout or 500-level error states in the UI if the future backend takes too long to respond.
