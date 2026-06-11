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
- **Audience Shift**: Instructed the AI to immediately pivot the UI tone from "licensed pharmacists only" to "client-facing" for everyday patients of Narayan Pharmacy, stripping out confusing medical jargon.

## Phase 2: Refinement & Simplification

### [June 11, 2026] Documentation Standardization (Evaluator Rubric)
- Completely rewrote `CLAUDE.md`, `AGENTS.md`, and this `MEMORY.md` file to strictly adhere to the professional evaluator rubric.
- Injected strict AI behavioral protocols into `AGENTS.md` to force continuous documentation updates.

### [June 11, 2026] UI Simplification & Rebranding
- **Action**: Removed the redundant lateral navigation (sidebar) and unnecessary account/settings header icons. Reclaimed horizontal space by removing the `md:ml-64` margin.
- **Rebranding**: Officially updated the HTML title and navigation headers strictly to "Narayan Pharmacy".
- **Bug Fix**: Added `"type": "module"` to `package.json` to eliminate Node.js ECMA parsing warnings caused by Tailwind v4.

---

## Pending Frontend Tasks
- **[PENDING]** Update the `fetch` call in `src/app/page.tsx` to point to the production Python backend URL once it is available.
- **[PENDING]** Handle potential timeout or 500-level error states in the UI if the future backend takes too long to respond.
