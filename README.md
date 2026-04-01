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

Point this at the WebiCast API instance you want to query in development, preview, or production.

## Verification

The project is currently verified with:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`
