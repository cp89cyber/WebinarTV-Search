# WebinarTV Search

Public search experience for the WebinarTV catalog, built as a React + Vite + TypeScript SPA.

## Features

- API-backed search with deep-linkable URL filters
- Category, timing, and sort controls
- Responsive editorial-style result grid
- Webinar detail pages with register/join/watch CTA precedence
- Zod-validated API responses
- Unit, component, and Playwright smoke coverage

## Requirements

- Node.js 24+
- npm 11+

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app uses `VITE_API_BASE_URL` and defaults to `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm test
npm run test:e2e
```

## Environment

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Point this at the WebiCast API instance you want to query in development, preview, or production. The canonical production API origin is:

```bash
VITE_API_BASE_URL=https://webi-cast-api.vercel.app
```

## Vercel Deployment

This project deploys to Vercel as a static Vite SPA.

- Deep links rely on the committed `vercel.json` rewrite to serve `index.html` for client-side routes.
- Set `VITE_API_BASE_URL=https://webi-cast-api.vercel.app` in both Preview and Production environments.
- Redeploy after changing `VITE_API_BASE_URL` because Vite bakes `VITE_*` values into the static bundle at build time.
- Do not point the app at same-origin `/v1/*` routes on `webinar-tv-search.vercel.app`; the SPA rewrite catches those paths and serves `index.html`, not the API.
- Missing production API config now fails in-app instead of silently targeting `http://localhost:3000`.
- In Vercel project settings, keep the framework preset as `Vite`, the build command as `npm run build`, and the output directory as `dist`.

## Verification

The project is currently verified with:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`
