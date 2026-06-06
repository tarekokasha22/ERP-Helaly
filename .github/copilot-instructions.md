## Quick orientation for AI coding agents

This repo contains a React + TypeScript frontend (in `client/`) and a TypeScript Express backend (in `server/`). There is also a `deployment/` pack with ready-to-upload static assets.

Keep instructions focused and actionable: reference concrete files, use existing scripts, and avoid changing deployment artifacts without confirming with a human.

### Big picture (what to know first)
- Frontend: `client/` is a Create‑React‑App TypeScript project. Key entry: `client/src/index.tsx`, pages live in `client/src/pages/`, contexts in `client/src/contexts/`, and services in `client/src/services/`.
- Backend: `server/` is a TypeScript Express app. Start point: `server/src/index.ts`. Routes live under `server/src/routes/*.routes.ts`, business logic in `server/src/controllers/`, and Mongoose models in `server/src/models/`.
- Local dev flow: frontend talks to backend via HTTP (axios + react-query). For fast local work the frontend uses a mock API (`client/src/services/mockApi.ts`)—toggle/mock behaviour is implemented there.
- Deployable static package: `deployment/deployment-ready/` contains files meant to be uploaded to `public_html/` on shared hosting. See `deployment/README.md` for full steps.

### Key files to reference when making changes
- Frontend scripts: `client/package.json` (`start`, `build`, `test`).
- Mock API: `client/src/services/mockApi.ts` (important: dispatches `localStorageChanged`, `projectDataChanged`, `sectionDataChanged`, etc.).
- API client targets: `client/src/services/` (look for `api.ts` or axios wrappers to change real backend endpoints).
- Backend config: `server/src/config/config.ts` (env vars: `JWT_SECRET`, `PORT`, `MONGODB_URI` — defaults are present here).
- Routes/controllers: `server/src/routes/*.routes.ts` and `server/src/controllers/*.ts` — follow these when adding endpoints.
- Seed & storage helpers: `server/src/utils/seed.ts` and `server/src/storage/jsonStorage.ts`.

### Developer workflows (concrete commands)
- Install dependencies
  - Frontend: `cd client && npm install`
  - Backend: `cd server && npm install`
- Run locally
  - Frontend dev: `cd client && npm start` (CRA dev server on :3000)
  - Backend dev: `cd server && npm run dev` (nodemon, watches `src`)
  - To run both, the repo has convenience batch scripts (Windows): `start-all.bat` or use separate terminals.
- Build for production
  - Frontend build: `cd client && npm run build` — output goes to `client/build`.
  - Backend build: `cd server && npm run build` (compiles to `server/dist`)
- Tests
  - Frontend: `cd client && npm test` (CRA tests)
  - Backend: `cd server && npm test` (Jest + ts-jest; tests use `mongodb-memory-server` in devDeps)

### Project-specific conventions & patterns
- Mock-first dev: many components rely on `client/src/services/mockApi.ts` for local testing. The mock module reads/writes `localStorage` and dispatches custom events; changing it affects many UI update flows.
- LocalStorage event pattern: the mock API explicitly dispatches `localStorageChanged` and domain-specific events (e.g., `projectDataChanged`) to ensure the dashboard updates. If you refactor state updates, preserve event dispatches or update all listeners.
- Country split data: mock API keeps separate country arrays (`egypt` vs `libya`) and always re-reads from `localStorage` for freshness — mirror this behavior when adding features that depend on country-scoped data.
- Auth & protected routes: frontend uses an AuthContext (`client/src/contexts/AuthContext.tsx`) and backend uses `server/src/middlewares/auth.middleware.ts`. Align token format and claims with `server/src/config/config.ts` defaults when testing locally.

### Integration points & external dependencies
- Frontend network: axios + react-query. If switching to the real API, update axios base URL in `client/src/services/api.ts` and flip any `USE_MOCK_API` flag.
- Backend DB: Mongoose. Default `MONGODB_URI` is `mongodb://localhost:27017/helaly-erp` (see `server/src/config/config.ts`). Tests use `mongodb-memory-server`.

### Deployment caveats (important)
- Use `helaly-erp/deployment/` and `deployment-ready/` when preparing files for shared hosting.
- When deploying to cPanel/public_html: watch out for preinstalled WordPress. If WordPress exists in `public_html` it will intercept routes (404s showing WordPress default pages). The deployment README explains removing WordPress files or uploading into an empty `public_html`.

### How to propose changes (short checklist for AI PRs)
1. Run the relevant tests locally (frontend/backend). If making a breaking change to the API, update both `client/src/services/*` and `server/*` routes/controllers and add/adjust tests.  
2. Keep commits small and focused: update one feature/module per PR.  
3. Update `deployment/README.md` only if you change deployment artifacts.  

If anything here is unclear or you want this file in Arabic as well, tell me which sections to expand and I will iterate.
