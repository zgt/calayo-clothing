# Security + Performance Review & Fix Pass — 2026-07-06

Recovered from session transcript `232a492e` (run 4:05–4:46 PM, 8 Opus fix
sub-agents, one per file). All fixes landed before the commissions-overhaul
work on `fable-refactor`. `pnpm typecheck` passed at the end of the run.

## Fixes applied

| File | Severity | Issue | Fix applied | Status |
|------|----------|-------|-------------|--------|
| `src/server/api/routers/profile.ts` | **High (security)** | No server-side path for `profile_measurements`; clients wrote the table directly | Added `getMeasurements` / `upsertMeasurements` protectedProcedures, Zod-validated, scoped to `ctx.user.id` (client-supplied `user_id` never trusted) | fixed |
| `src/app/profile/measurements/_components/MeasurementsForm.tsx` | **High (security)** | Upserted `profile_measurements` from the browser via anon-key Supabase client, unvalidated | Now calls `api.profile.upsertMeasurements`; NaN-guarded number parsing; UI behavior preserved | fixed |
| `src/app/profile/_components/ProfileForm.tsx` | **High (security)** | Updated the `user` table from the browser via anon key, bypassing `profile-validation.ts` | Now calls the existing `api.profile.updateProfile` (validated, server-scoped) | fixed |
| `src/app/commissions/utils.ts` + `hooks/useMeasurementLoader.ts` | **High (security)** | Read `profile_measurements` from the browser via anon key | Client-side fetch removed; hook uses `utils.profile.getMeasurements.fetch()` with a measurement-key allowlist | fixed |
| `src/server/api/routers/commissions.ts` | Medium (security) | Raw Postgres error messages returned to clients at 8 sites | Generic client messages; real errors logged server-side; PGRST116→NOT_FOUND mapping preserved | fixed |
| `src/server/api/routers/instagram.ts` | Low (perf) | `getAllInstagramPhotos` unbounded (homepage uses ≤24) | Added `.limit(100)` | fixed |
| `UnifiedFormLayout.tsx` + 4 model files | **High (perf)** | Commissions page eagerly downloaded all four GLTF sets (~266MB on disk, jacket 131MB) via two preload paths, and disabled garment options until done | Removed `preloadAllGarments()` + module-level `useGLTF.preload()`; models load on-demand via existing Suspense/loading UI | fixed |
| `src/app/_components/ShaderGradient.tsx` | Medium (perf) | three.js + @shadergradient in the initial bundle of every page | Split into `ShaderGradientInner.tsx` loaded via `next/dynamic` (`ssr:false`); visuals unchanged | fixed |
| `src/app/_components/CircularPhotoLayout.tsx` | Medium (perf) | Every photo click re-ran the GSAP effect, leaking Draggable instances + 3 infinite tweens + the timeline each time | Cleanup now kills everything the effect creates | fixed |
| `src/app/_components/CursorTrail.tsx` | Medium (perf) | rAF loop + DOM particle spawn every 50ms forever, even with the mouse idle (or never moved) | Spawns only on real movement; loop fully stops when idle with no particles | fixed |
| `src/app/page.tsx` | Low (perf) | Duplicate `<ReactLenis root />` (CircularPhotoLayout creates its own) | Removed | fixed |

## Pre-existing typecheck breakage (also fixed)

`pnpm typecheck` was already failing before the pass (71 errors from the
"updated packages" commit) — verified by stashing and re-running:

- better-auth 1.4 renamed `forgetPassword` → `requestPasswordReset`
  (`auth-client.ts`, `forgot-password/page.tsx`).
- Typed the `setAll` cookie params in `utils/supabase/server.ts`.
- gsap 3.14 ships a broken exports map (types declared as
  `types/InertiaPlugin.d.ts` but shipped kebab-case as
  `inertia-plugin.d.ts`), making tsc type-check gsap's raw JS.
  **Follow-up correction:** the initial fix (tsconfig `paths` mappings)
  broke runtime — Next.js applies tsconfig `paths` to runtime module
  resolution, so `gsap/ScrollTrigger` resolved to a `.d.ts` with no runtime
  exports (`undefined.getAll()`). Final fix: removed the gsap `paths`
  entries (only `~/*` remains) and set `checkJs: false` instead. Tradeoff:
  `src/env.js` and `next.config.js` are no longer tsc-checked (`env.js` is
  runtime-validated by zod/`createEnv` anyway).

## Suspected findings — review manually (NOT auto-fixed)

1. **The anon key can still reach the DB directly (biggest remaining
   risk).** The app now routes its own reads/writes through tRPC, but
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public, and since Better-Auth owns
   identity, `auth.uid()`-based RLS can't apply — if RLS is off or
   permissive, anyone can hit the Supabase REST API for any table. Proper
   fix: use a `SUPABASE_SERVICE_ROLE_KEY` server-side and enable deny-all
   RLS for `anon` on all tables. Needs Supabase dashboard/env access to
   verify current policies.
2. **`Messages.tsx` — IDOR.** Chat reads/inserts `messages` by
   `commission_id` straight from the browser (plus a realtime
   subscription); nothing server-side stops a user from reading or posting
   into another user's commission thread. Needs RLS or a server-backed
   redesign of the realtime flow.
3. **`src/utils/supabase/middleware.ts` is dead code** — Next.js only runs
   `middleware.ts` at root or `src/`, so it never executes. Pages do guard
   themselves server-side (admin + profile pages checked), so nothing is
   exposed, but delete it or promote it deliberately.
4. **GLTF assets need compression** — 266MB in `public/3d-assets/`
   (uncompressed geometry + textures). On-demand loading fixed the eager
   download, but selecting "jacket" still fetches 131MB. Run through
   Draco/meshopt + KTX2/resized textures (e.g. `gltf-transform optimize`).
5. **Dev-only artificial latency**: `trpc.ts:103-107` adds a random
   100–500ms delay to every tRPC call in dev (T3 scaffold default). Safe to
   delete if local slowness is a complaint.
6. **No rate limiting** on tRPC or `/api/*` route handlers (Better-Auth
   covers only its own endpoints in production). Consider Upstash/Vercel
   rate limiting if abuse becomes a concern.
7. **Dead code candidates**: `PhotoGrid.tsx`, `PhotoModalGrid.tsx`,
   `InfinitePhotoGrid.tsx`, `post.tsx` + the `post` router (public
   in-memory scaffold mutation), and `commissions/README.md` still
   documented the removed client-side `fetchProfileMeasurements` (README
   was refreshed later on `fable-refactor`).

## Behavior note

Garment options in the commissions form are no longer disabled while 3D
models load — the viewer shows its loading state instead. (Superseded by
the later commissions-overhaul work, which added a loading spinner +
progress bar to the model viewer.)

---

# Remediation — 2026-07-07

All 7 suspected findings addressed on `fable-refactor`:

| # | Finding | Resolution |
|---|---------|-----------|
| 1 | Anon key reaches DB directly | Server now uses a service-role client (`createServiceClient`, needs `SUPABASE_SERVICE_ROLE_KEY` env); the anon key is fully retired (browser client deleted, env entries removed). Migration set 5 (`src/server/migrations/5/`) denies anon/authenticated at the DB — **apply manually after deploying with the service key**. Covers Better-Auth tables too (session tokens were REST-readable). |
| 2 | `Messages.tsx` IDOR | Chat rewritten onto new `messages` tRPC router (`list`/`send`/`markRead`), all owner-or-admin gated via `assertCommissionAccess` (non-oracle NOT_FOUND); `sender_id` comes from the session. Realtime subscription replaced with a 5s poll + instant sender echo. |
| 3 | Dead `src/utils/supabase/middleware.ts` | Deleted (with PhotoGrid/PhotoModalGrid/InfinitePhotoGrid, `post.tsx`, and the `post` router). |
| 4 | GLTF assets 266MB | Compressed to four `.glb` bundles (~5.9MB total; jacket 131MB→2.2MB) via `scripts/optimize-3d-assets.sh` (Draco + 2048px WebP; decoder self-hosted in `public/draco/`). Meshopt was tried first and rejected: its quantization moves geometry into normalized space with compensation on node transforms, which `GLTFGarment` ignores — Draco decodes back to the original coordinate space (verified: position bounds identical pre/post). Originals archived in `~/archives/calayo-3d-originals/`. Note: originals remain in git history; `git filter-repo` is an optional follow-up. |
| 5 | Dev-only artificial tRPC latency | Removed from `timingMiddleware`. |
| 6 | No rate limiting | In-memory sliding-window limiter (`src/server/api/rate-limit.ts`): tRPC mutations 30/min per user-or-IP (queries unlimited — chat polls), Better-Auth `rateLimit` config (5/min sign-in/sign-up, 3/min password-reset/magic-link, enabled in dev), uploads 20/min per admin. Per-instance memory — swap for Redis if scaling out. |
| 7 | Dead code | Removed in the same commit as #3. |

Decisions taken: polling over a Supabase-JWT realtime bridge; Draco with a
self-hosted decoder (meshopt broke geometry coordinate space, see #4);
in-memory limits over Upstash.

Outstanding user actions:
1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` (dashboard → Settings → API) —
   the app fails env validation without it.
2. Apply `src/server/migrations/5/01_lock_down_client_roles.sql` via psql
   after deploying, then run the verification queries in the file header.
3. Visually verify the four garments in the commissions designer
   (silhouette/scale/orientation) after the meshopt compression.
