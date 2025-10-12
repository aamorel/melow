# Melow

## Goal

The goal of this app is to help users practice their musical ear training skills by identifying intervals, chords, and scales.

## Tech Stack & Tooling
- **Runtime**: React 19 with TypeScript (strict mode, `noUnused*` enabled).
- **Build tooling**: Vite 7 (`npm run dev/build/preview`), TypeScript project references (`tsconfig.app.json`).
- **Styling**: Tailwind CSS 3 with PostCSS + Autoprefixer (`src/index.css`/`src/App.css`).
- **Linting**: ESLint 9 with React / React Hooks plugins (`npm run lint`).
- **Audio**: Web Audio API wrapped by `src/services/audioEngine.ts`.
- **Persistence**: Browser `localStorage` via `src/services/database.ts`.

## Project Structure
```
src/
  App.tsx                 // App shell: exercise selector + layout
  components/             // Reusable UI + game widgets
    Game/                 // Interval game-specific UI pieces
    Stats/                // Progress visualisations
    UI/                   // Generic buttons, layout
  features/
    listening/            // Listening exercise container
  hooks/                  // Custom hooks (state, audio)
  services/               // Non-React singletons (audio engine, interval generator, db)
  types/                  // Shared TypeScript types
  utils/                  // Pure helpers and constants
```
`public/` hosts static assets; Vite handles entry via `src/main.tsx`.

## Core Concepts
- **Exercises**: Defined in `src/App.tsx` as metadata; currently only `ListeningExercise`.
- **Game loop**: `useGameState` owns reducer-based session state, question sequencing, and auto-saving finished sessions.
- **Question generation**: `intervalGenerator.generateQuestions` builds ten-question sets from `GAME_LEVELS`.
- **Audio**: `useAudio` lazily initialises Web Audio context and exposes note/interval playback queues with basic envelopes per instrument.
- **Statistics**: `ProgressChart` & `SessionHistory` query the database service each render for local history.

## Coding Conventions
- Prefer TypeScript types from `src/types` over inline definitions; keep `Interval`, `Instrument`, etc consistent.
- Keep components presentational where possible; logic goes into hooks/services.
- Use Tailwind utility classes for layout/styling; avoid inline styles.
- Derived state belongs in selectors (`computed` return from hooks) instead of component-level recalculation.
- When introducing new exercises, colocate their specific UI under `src/features/<exercise>/`.

## Commands
- `npm run dev` – Vite dev server
- `npm run build` – TypeScript project build + Vite production bundle
- `npm run preview` – Preview the production build
- `npm run lint` – ESLint with project rules

## Data & Persistence Notes
- Sessions auto-save after completion; guard against duplicate saves via `useRef` set in `useGameState`.
- LocalStorage keys: `melow_sessions`, `melow_answers`, `melow_settings`. Future agents should migrate or namespace carefully if storage schema changes.
- Average response times saved in milliseconds; UI displays seconds (`/ 1000`).

## Known Gaps / Future Work
- Only the listening exercise is implemented; additional exercise shells should follow the same metadata-driven approach.
- No automated tests yet; consider adding component/unit tests when logic grows.
- Audio engine is browser-only; server-side rendering not supported.
