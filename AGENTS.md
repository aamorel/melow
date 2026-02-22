# Melow

## Goal

The goal of this app is to help users practice their musical ear training skills by identifying intervals, chords, scales, and pitch accuracy.

## Tech Stack & Tooling
- **Runtime**: React 19 with TypeScript (strict mode, `noUnused*` enabled).
- **Build tooling**: Vite 7 (`npm run dev/build/preview`), TypeScript project references (`tsconfig.app.json`).
- **Styling**: Tailwind CSS 3 with PostCSS + Autoprefixer (`src/index.css`).
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
    chords/               // Chord quality exercise
    pitch/                // Pitch matching exercise
    scales/               // Scale recognition exercise
  hooks/                  // Custom hooks (state, audio)
  services/               // Non-React singletons (audio engine, interval generator, db)
  types/                  // Shared TypeScript types
  utils/                  // Pure helpers and constants
```
`public/` hosts static assets; Vite handles entry via `src/main.tsx`.

## Core Concepts
- **Exercises**: Defined in `src/App.tsx` metadata; current exercises are Listening, Chords, Pitch Match, and Scales.
- **Game loop**: Each exercise has a reducer hook (`useGameState`, `useChordGameState`, `usePitchGameState`, `useScaleGameState`) for session state, sequencing, and auto-saving finished sessions.
- **Question generation**: `intervalGenerator`, `chordGenerator`, and `scaleGenerator` build ten-question sets from their respective `*_LEVELS`.
- **Audio**: `useAudio` lazily initialises Web Audio context and exposes note/interval/chord/scale playback queues with basic envelopes per instrument.
- **Statistics**: `ProgressChart` & `SessionHistory` query the database service each render for local history.

## Coding Conventions
- Prefer TypeScript types from `src/types` over inline definitions; keep `Interval`, `Instrument`, etc consistent.
- Keep components presentational where possible; logic goes into hooks/services.
- Use Tailwind utility classes for layout/styling; avoid inline styles.
- Derived state belongs in selectors (`computed` return from hooks) instead of component-level recalculation.
- When introducing new exercises, colocate their specific UI under `src/features/<exercise>/`.
- Factorization rules for exercise UIs:
  - Use `AnswerGrid` for multiple-choice answer buttons (intervals, chords, scales).
  - Use `useAutoAdvanceOnResult` for timed post-answer transitions.
  - Use `calculateSessionMetrics` to build completion summaries.

## Commands
- `npm run dev` – Vite dev server
- `npm run build` – TypeScript project build + Vite production bundle
- `npm run preview` – Preview the production build
- `npm run lint` – ESLint with project rules

## Data & Persistence Notes
- Sessions auto-save after completion; guard against duplicate saves via `useRef` in each exercise state hook.
- LocalStorage keys: `melow_sessions`, `melow_answers`, `melow_settings`. Future agents should migrate or namespace carefully if storage schema changes.
- Average response times saved in milliseconds; UI displays seconds (`/ 1000`).

## Known Gaps / Future Work
- No automated tests yet; consider adding component/unit tests when logic grows.
- Audio engine is browser-only; server-side rendering not supported.
