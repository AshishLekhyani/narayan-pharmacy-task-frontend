# Project Overview
**Narayan Pharmacy - Clinical Prescription Validation System**

PharmaSync Pro is a custom, clinical-grade web application engineered for **Narayan Pharmacy**. Its primary purpose is to modernize the prescription entry process and immediately interface with a Claude AI backend to run advanced pharmacokinetic and pharmacodynamic interaction checks.  

## Tech Stack & Project Structure
- **Frontend Framework**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4 with a custom "Clinical Precision" design system utilizing CSS `clamp()` for fluid typography.
- **State Management**: `@tanstack/react-query` to manage asynchronous validation against API routes.
- **Motion & Scrolling**: `framer-motion` for state transitions and `@studio-freight/react-lenis` for momentum scrolling.
- **Project Structure**:
  - `src/app/page.tsx`: Core prescription entry UI.
  - `src/app/history/page.tsx`: Audit log and history UI.
  - `src/app/api/analyze/route.ts`: API Endpoint orchestrating the simulated Claude AI inference logic.
  - `src/components/`: Reusable modular components (future expansion).

## How to Run Locally
1. **Dependencies**: Run `npm install`
2. **Environment Variables**: No `.env` is required for the frontend yet. Once the backend is built, `NEXT_PUBLIC_API_URL` will be required to point to the Python server.
3. **Development**: Run `npm run dev` to start the local development server (http://localhost:3000).
4. **Production Build**: Run `npm run build` followed by `npm start`.

> [!NOTE]
> **AI Agent Instructions**
> If you are an AI assistant, you MUST also read `AGENTS.md` to understand the operational rules and behavioral protocols expected for this project.

## Key Conventions
- **Strict Typing**: All components, props, and API payloads must be strongly typed using TypeScript interfaces. Avoid `any`.
- **Component Organization**: Favor modular, pure functional components. Avoid monolithic files. 
- **Naming Conventions**: Use PascalCase for components (`TopNavBar.tsx`), camelCase for utility functions, and kebab-case for CSS classes.
- **API Patterns**: All data fetching must be executed via `@tanstack/react-query` mutations/queries communicating with Next.js API Routes, which will eventually proxy to the Python backend.

## Constraints & Gotchas
> [!WARNING]
> **AI Inference Delays**
> Always implement loading states (`interaction-loading`, `Loader2` spinners) to mask AI latency during interaction checks.

- **Data Density**: Clinical data tables must use monospaced fonts (`data-mono`). Padding should be compact to allow high information density.
- **Build Caching**: Always run `npm run build` after modifying global configurations (like `tailwind.config.ts`) before testing production behavior.
