# Coffee Shop Tracker

A mobile-first PWA for two people to log coffee shop visits, rate them (coffee, atmosphere, food, service — half-star steps) and browse shops on a map.

React + Vite · Leaflet/OpenStreetMap · Nominatim geocoding · Supabase (Postgres + Storage).

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the `shops` and `visits` tables, row-level-security policies, and the public `visit-photos` storage bucket.
3. From **Project Settings → API**, copy the Project URL and the `anon` public key into `.env`:

   ```bash
   cp .env.example .env
   ```

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR (`--host` to open it from a phone on the same Wi-Fi) |
| `npm run build` | Production build to `dist/` (also generates the service worker + manifest) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |

## Deploy

Either host works; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the host's dashboard.

- **Vercel**: `npx vercel` (SPA rewrites are in `vercel.json`).
- **Netlify**: build command `npm run build`, publish directory `dist` (SPA rewrites are in `public/_redirects`).

Then open the site on your phone and choose **Add to Home Screen** (Safari share sheet on iOS, menu → Install app on Android Chrome).

"Use my current location" needs HTTPS, so it works on the deployed site and `localhost`, but not over a plain `http://192.168…` LAN address.
