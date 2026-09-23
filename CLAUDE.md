# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (add `-- --host` to test from a phone on the LAN)
- `npm run build` — production build; also emits `sw.js` + `manifest.webmanifest` via vite-plugin-pwa
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- No test suite exists yet.

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (see `.env.example`). Without them the app renders a setup notice instead of the UI (`isSupabaseConfigured` in `src/lib/supabase.js`). Vite inlines these at build time, so whatever `.env*` file is present when you run `npm run build` is baked into `dist/`.

## What this is

Mobile-first PWA for two people (no auth, no users table) to log coffee shop visits. Plain JavaScript + React 19, react-router, Leaflet via react-leaflet, Supabase JS client talking directly to Postgres/Storage — there is no backend code.

## Architecture

- **Data loading**: `src/data/ShopsProvider.jsx` fetches *all* shops with nested visits in one query (`shops.select('*, visits(*)')`) and exposes `{ shops, loading, error, reload }` through `useShops()` (`src/data/shopsContext.js`). Every page reads from this context; after any write, call `await reload()` rather than patching local state. Each shop is enriched with `average`, `categories`, `visitCount`.
- **Ratings are derived, never stored**: `src/lib/ratings.js` is the single source for category list (`CATEGORIES` — coffee/atmosphere required, food/service optional), per-visit overall (mean of non-null categories), shop average (mean of visit overalls), and `ratingColor()` which is shared by the list badges and map pins so colors stay consistent. Add/rename a rating category there and in `supabase/schema.sql`.
- **Writes** go through `src/lib/api.js` (`createShop`, `createVisit`, `uploadPhoto`). Photos are downscaled client-side to a ~1600px JPEG (`src/lib/image.js`) and uploaded to the public `visit-photos` bucket at `<shopId>/<uuid>.jpg`; the public URL is stored in `visits.photo_url`.
- **Geocoding** (`src/lib/geo.js`) uses Nominatim. Its usage policy forbids search-as-you-type, so address search only runs on explicit submit — don't convert it to autocomplete. Reverse geocoding after "use my location" fills the address and, if the point is a café, the shop name.
- **New-shop UI** (`src/components/NewShopFields.jsx`) is shared by the standalone Add Shop page and the inline "+ Add a new shop" option in Log Visit. Its `onChange` must be a React state setter because it's called with updater functions (async lookups must not clobber what the user typed).
- **Scrolling**: the scroll container is `<main className="app-main">`, not the window (fixed bottom tab bar layout). `Main` in `App.jsx` resets its scroll on route change. The map page absolutely fills `main`.
- **Routes**: `/` list, `/map`, `/shops/new`, `/shops/:id`, `/visits/new?shop=<id>`. BrowserRouter is used, so hosting needs SPA rewrites (`vercel.json`, `public/_redirects`).

## Supabase

Schema, RLS policies and storage bucket are in `supabase/schema.sql` (run manually in the Supabase SQL editor; there is no migration tooling). The anon role can only `select` and `insert` — editing/deleting visits is out of scope for v1, so adding those features requires new RLS policies too.

## PWA

Configured in `vite.config.js`. Icons in `public/` were generated from `public/logo.svg` with `npx pwa-assets-generator --preset minimal-2023 public/logo.svg`; rerun that if the logo changes. The service worker precaches the app shell and runtime-caches OSM tiles; Supabase and Nominatim requests are always live.

## Out of scope for v1

Auth/accounts, editing or deleting visits, offline support beyond basic PWA caching.
