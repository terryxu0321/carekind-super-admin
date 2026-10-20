# carekind-super-admin

Super Admin app (CareKind platform) — part of **CareKind AI**.

- Stack: React + TypeScript
- Requirements, boundaries and module guidance: [src/super-admin](https://github.com/terryxu0321/JRAgedCareProject/tree/main/company-os/06-app-development/src/super-admin)
- **All documentation lives in the meta repo** [terryxu0321/JRAgedCareProject](https://github.com/terryxu0321/JRAgedCareProject) (PRD, specs, rules, decisions, changelog). This repo holds only code, tests and config.
- Before working here (people or AI agents), read the meta repo's root `AGENTS.md` and the module guidance linked above.

Formatting follows `.editorconfig` (tabs, width 4). Never commit secrets or real resident / personal data — this repo is public.

## Development

Needs Node 20+ and a built `packages/carekind-shared` (`npm run build` there first). The API (`carekind-api`) runs on port 3000.

```sh
cp .env.example .env   # optional: set VITE_API_BASE_URL (default http://localhost:3000)
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run typecheck
npm run lint       # ESLint + Prettier check
npm test           # Vitest + Testing Library (synthetic data only)
```
