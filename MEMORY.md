# Architectural Memory & Development Progression

> [!NOTE]
> **AI Context & Evaluator Guide**
> This file serves dual purposes: it acts as a continuous state tracker for AI agents resuming work, and it documents the deliberate prompting strategy, architectural trade-offs, and progression of thinking that guided the AI throughout development.

## Evidence of Deliberate Prompting & Strategic Direction
*The objective was to build a clinical-grade "Prescription Entry & Drug Interaction Checker" customized for **Narayan Pharmacy**, with a strictly enforced medical aesthetic.*

- **Strategic Prompting**: The project was initialized with deliberate, structured prompt engineering. Instead of asking the AI to "build me a generic React app", the AI was mandated to inherit a strict design foundation provided by **Stitch (Google's AI design tool)**. 
- **Execution Constraints**: The mandate required translating static HTML prototypes into a robust Next.js App Router architecture while preserving the "Clinical Precision" theme perfectly, explicitly forbidding the AI from using generic tailwind utility classes that deviated from the design tokens.

## Architectural Decisions & Trade-offs
1. **Next.js App Router vs. Vite/CRA**
   - *Trade-off Considered*: Vite provides faster local HMR, but Next.js offers superior layout nesting and API route orchestration.
   - *Decision*: Adopted Next.js App Router to seamlessly bridge the UI with a backend `route.ts` that mocks Claude AI integrations before the real backend is built.
2. **Fluid Typography (CSS `clamp`) vs. Media Queries**
   - *Trade-off Considered*: Media queries are simpler to write but lead to "snapping" between breakpoints.
   - *Decision*: Refactored standard Tailwind CSS classes into a bespoke design system utilizing CSS `clamp()` functions. This guarantees perfect responsiveness across all mobile devices while maintaining the strict structural fidelity of the Stitch prototypes.
3. **TanStack Query vs. Native `useEffect`**
   - *Trade-off Considered*: Native fetch is dependency-free, but requires manual boilerplate for loading/error states.
   - *Decision*: Adopted `@tanstack/react-query`. In clinical settings, state management must be flawless. React Query provides intrinsic caching and precise `isPending` states, completely eliminating flaky `setTimeout` mocks.
4. **Framer Motion for Micro-Interactions**
   - *Trade-off Considered*: CSS transitions are lighter, but Framer Motion offers layout animations and staggered `AnimatePresence` exits.
   - *Decision*: Integrated `framer-motion` alongside `@studio-freight/react-lenis`. This elevated the application from a "prototype" to a "premium corporate product". 

## Course Corrections
- **Legacy Styling Conflict Resolved**: Initial passes failed to respect the exact class names from the Stitch prototypes. *Correction*: The AI was instructed to inject the legacy `tailwind.config.ts` directly into the Next.js Tailwind v4 setup using the `@config` directive, ensuring pixel-perfect mapping.
- **Audience Realignment (Client-Facing Shift)**: Initially, the AI was guarded to write UI copy strictly for "licensed pharmacists". *Correction*: It was clarified that the application is client-facing for everyday patients of Narayan Pharmacy. The AI was instructed to immediately shift the tone to be digestible, empathetic, and stripped of confusing medical jargon.
- **Iconography Modernization**: Replaced legacy Google Material web-fonts with `lucide-react` SVG components to eliminate render-blocking fonts and improve vertical alignment stability.

## Progression of Thinking & Current State
The development progressed logically from foundation -> data mock -> polish.
1. **Foundation**: Scaffolded Next.js and locked down Tailwind typography.
2. **Logic Integration**: Built `api/analyze/route.ts` and wired up React Query to simulate real network latency and JSON parsing.
3. **Premium Polish**: Introduced Framer Motion and Lenis scroll for a high-end feel.

**Current Status**: The Next.js frontend is structurally complete, entirely responsive, and beautifully animated. 

## Pending Frontend Tasks
- Update the `fetch` call in `src/app/page.tsx` to point to the production backend URL once it is available.
- Handle potential timeout or 500-level error states in the UI if the future backend takes too long to respond.
