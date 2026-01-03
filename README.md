# DJOBBA Works

Modern React web app built with Vite + TypeScript + Tailwind/shadcn UI.

## Prereqs
- Node 18+ and npm

## Getting started
```sh
npm install
npm run dev
```
App runs on http://localhost:5173 by default.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Tech stack
- React 18, TypeScript
- Vite build tool
- Tailwind CSS + shadcn UI + Radix primitives
- React Query, React Router, Recharts

## Build/Deploy
```sh
npm run build
```
Outputs to `dist/`. Serve the `dist` folder with any static host (e.g., Netlify, Vercel, S3/CloudFront).

## Notes
- ESLint config lives in `eslint.config.js`.
- Favicon is at `public/favicon.svg`.
