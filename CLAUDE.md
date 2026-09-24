# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (add `-- --host` to test from a phone on the LAN)
- `npm run build` — production build; also emits `sw.js` + `manifest.webmanifest` via vite-plugin-pwa
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- No test suite exists yet.

Requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAP_ID` in `.env` (see `.env.example`). Without them the app renders a setup notice listing what's missing (`REQUIRED_ENV` in `src/App.jsx`). The Google key is referrer-restricted, so local dev must run on `http://localhost:5173`. Vite inlines these at build time, so whatever `.env*` file is present when you run `npm run build` is baked into `dist/`.

## What this is

Mobile-first PWA for two people (no auth, no users table) to log coffee shop visits. Plain JavaScript + React 19, react-router, Google Maps via `@vis.gl/react-google-maps` (`APIProvider` wraps the app in `App.jsx`), Supabase JS client talking directly to Postgres/Storage — there is no backend code.

## Architecture

- **Data loading**: `src/data/ShopsProvider.jsx` fetches *all* shops with nested visits in one query (`shops.select('*, visits(*)')`) and exposes `{ shops, loading, error, reload }` through `useShops()` (`src/data/shopsContext.js`). Every page reads from this context; after any write, call `await reload()` rather than patching local state. Each shop is enriched with `average`, `categories`, `visitCount`.
- **Ratings are derived, never stored**: `src/lib/ratings.js` is the single source for category list (`CATEGORIES` — coffee/atmosphere required, food/service optional), per-visit overall (mean of non-null categories), shop average (mean of visit overalls), and `ratingColor()` which is shared by the list badges and map pins so colors stay consistent. Add/rename a rating category there and in `supabase/schema.sql`.
- **Writes** go through `src/lib/api.js` (`createShop`, `createVisit`, `uploadPhoto`). Photos are downscaled client-side to a ~1600px JPEG (`src/lib/image.js`) and uploaded to the public `visit-photos` bucket at `<shopId>/<uuid>.jpg`; the public URL is stored in `visits.photo_url`.
- **Places search** (`src/lib/places.js`) uses the Places API (New) JS classes (`AutocompleteSuggestion`, `Place.searchNearby`) — not the legacy `Autocomplete` widget. Typeahead is debounced and uses one `AutocompleteSessionToken` per search→pick cycle for billing. "Use my location" runs a 150 m nearby search for cafés so the user can pick the one they're in, with a plain-pin fallback. Shops store `google_place_id` (null for hand-dropped pins), used for the "Open in Google Maps" link. Google's terms require Places results to be shown with Google attribution and on a Google map, which is why Leaflet/OSM was removed entirely.
- **Maps**: `AdvancedMarker` needs a Map ID (`VITE_GOOGLE_MAP_ID`). Each `<GoogleMap>` has an `id` so `useMap(id)` targets the right instance. `MapsStatus` shows an error when the key is rejected.
- **New-shop UI** (`src/components/NewShopFields.jsx`) is shared by the standalone Add Shop page and the inline "+ Add a new shop" option in Log Visit. Its `onChange` must be a React state setter because it's called with updater functions (async lookups must not clobber what the user typed).
- **Scrolling**: the scroll container is `<main className="app-main">`, not the window (fixed bottom tab bar layout). `Main` in `App.jsx` resets its scroll on route change. The map page absolutely fills `main`.
- **Routes**: `/` list, `/map`, `/shops/new`, `/shops/:id`, `/visits/new?shop=<id>`. BrowserRouter is used, so hosting needs SPA rewrites (`vercel.json`, `public/_redirects`).

## Supabase

Schema, RLS policies and storage bucket are in `supabase/schema.sql` (run manually in the Supabase SQL editor; there is no migration tooling). The anon role can only `select` and `insert` — editing/deleting visits is out of scope for v1, so adding those features requires new RLS policies too.

## PWA

Configured in `vite.config.js`. Icons in `public/` were generated from `public/logo.svg` with `npx pwa-assets-generator --preset minimal-2023 public/logo.svg`; rerun that if the logo changes. The service worker precaches the app shell only; Supabase and Google requests are always live (Google's terms don't allow caching its tiles).

## Out of scope for v1

Auth/accounts, editing or deleting visits, offline support beyond basic PWA caching.
