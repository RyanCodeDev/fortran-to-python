# Repository Guidelines

## Project Structure & Module Organization

Reanimate is a client-side React + TypeScript app built with Vite that converts FORTRAN to Python through a user-configured OpenAI-compatible server.

- `src/App.tsx` implements the interface, settings, uploads, and conversion flow; `src/main.tsx` mounts React.
- `src/lib/llm.ts` contains endpoint validation, API requests, conversion prompts, and response cleanup. Keep reusable server logic here.
- `src/App.css` and `src/index.css` define styling; `src/assets/` holds bundled images and SVGs. `public/` contains static assets.
- `tests/llm.test.ts` covers the API helpers. `dist/` is generated build output.

## Build, Test, and Development Commands

Use Node.js 22.18+ or 24+.

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm test`: execute the TypeScript tests directly with Node.
- `npm run lint`: run ESLint, including TypeScript, React Hooks, and React Refresh rules.
- `npm run build`: check TypeScript projects and produce static files in `dist/`.
- `npm run preview`: serve the production build locally.

## Coding Style & Naming Conventions

Follow existing TypeScript and TSX conventions: two-space indentation, single-quoted strings, and generally omitted statement-ending semicolons. Use PascalCase for components and types, camelCase for functions and variables, and explicit type-only imports where appropriate. Follow existing CSS naming patterns. ESLint is configured in `eslint.config.js`; no dedicated formatter is configured.

## Testing Guidelines

Use `node:test` with `node:assert/strict` and descriptive behavior-based test names. Keep helper tests in `tests/llm.test.ts`; mock `globalThis.fetch` and restore it after each test. Cover validation, request payloads, cancellation, response handling, and privacy options when changing API behavior. No coverage threshold is configured. Run tests, lint, and build before submitting; manually check affected UI flows.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no established commit convention can be verified. Use concise, imperative commit subjects. Describe the change, its purpose, and validation in pull requests; link related issues and include screenshots for visual changes.

## Privacy & Configuration

Preserve direct browser-to-server requests and opt-in connections. Keep API keys in tab memory and source/output code out of persistent storage. Never execute generated Python in the app or commit credentials.
