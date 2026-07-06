**Role & goal:** You are the orchestrator of a security + performance review-and-fix pass on this repository — a T3 Stack app (Next.js 15 App Router, tRPC, Better-Auth with the admin plugin, Supabase/PostgreSQL, UploadThing, Resend, plus a heavy React Three Fiber / GSAP / Framer Motion front end). Priorities in order: **(1) security**, then **(2) performance/responsiveness** (the site runs slow). You will **review the code, then automatically spawn Opus sub-agents to fix the confirmed issues**, then verify.

## Phase 1 — Review (do this yourself, first)

Read the actual code before claiming anything. Every finding cites `path:line`. Trace data flow with grep/glob rather than guessing. Label each finding **Confirmed** (you read the code and it's definitely wrong) or **Suspected** (depends on context you can't see — state what you'd need).

**Security — check specifically:**
- **tRPC authorization** in `src/server/api/routers/` (`commissions.ts`, `instagram.ts`, `profile.ts`, `post.ts`): correct guard from `src/server/api/trpc.ts` (`publicProcedure` / `protectedProcedure` / `adminProcedure`)? Flag any procedure touching another user's data without scoping to the caller's id (IDOR). Cross-check admin gating vs `src/lib/admin-utils.ts`, `src/lib/auth.ts`.
- **Supabase**: Better-Auth (not Supabase Auth) owns identity, so RLS may not protect rows — is service-role/anon key used, and are queries scoped by user id in app code? Flag string-built SQL (injection) vs parameterized.
- **Input validation**: Zod on all tRPC inputs? Is `src/lib/profile-validation.ts` actually applied? Flag unvalidated input reaching the DB or `src/lib/email.ts`.
- **Uploads**: `src/app/api/uploadthing/` — file-type/size limits and auth on the route.
- **Secrets / external calls**: `src/env.js` and Instagram (`src/app/api/instagram/`, `instagram.ts`) — is `INSTA_ACCESS_TOKEN` exposed client-side (`NEXT_PUBLIC_` misuse) or logged? Hardcoded secrets?
- **Rate limiting / CSRF**: no `middleware.ts` exists — do route handlers under `src/app/api/` need rate limiting or origin checks?
- **Error leakage**: raw DB/stack errors returned to the client.

**Performance — check specifically:**
- **DB**: N+1 / unbounded queries in routers (esp. `src/server/api/commissions/fetch-profile-measurements.ts`); missing `.limit()` / indexes.
- **Instagram**: fetched every request with no caching? Suggest `unstable_cache` / route caching / ISR.
- **Images**: `next/image` with sizing vs raw `<img>`; check `next.config.js`. Suspects: `PhotoGrid.tsx`, `PhotoModalGrid.tsx`, `InfinitePhotoGrid.tsx`, `CircularPhotoLayout.tsx`.
- **3D / animation**: `src/app/_components/3d/`, `ShaderGradient.tsx`, R3F/Drei GLTF, GSAP, Framer Motion, `CursorTrail.tsx` — eager loads that should be `next/dynamic` (`ssr:false`), uncompressed/un-preloaded GLTF, render loops that never idle.
- **React**: unmemoized expensive components, re-running effects, context churn, per-frame re-renders.
- **Bundle**: client components that could be server components; heavy libs in the initial bundle.

## Phase 2 — Triage & plan

- Keep **only Confirmed findings** for auto-fixing. List Suspected ones separately at the end — do **not** spawn agents for them.
- Group the confirmed findings **by file**. Order groups security-first, then by impact.
- Print a one-line-per-file plan (`file — N fixes: <short list>`), then proceed automatically to Phase 3. Do **not** wait for my approval, but if any fix is destructive or ambiguous, leave it for the Suspected list instead of guessing.

## Phase 3 — Fix via Opus sub-agents

- Spawn **one sub-agent per file** using the Agent tool with `subagent_type: general-purpose` and `model: opus`. One agent per file so no two agents write the same file. Launch independent file-agents **in parallel (multiple Agent calls in a single message)**.
- Give each agent: the file path, the exact confirmed findings for that file (with line numbers), the intended fix for each, and these constraints:
  - Fix **only** the listed findings; do not refactor or touch unrelated code.
  - Match the surrounding code's style, imports, and tRPC/Zod/Better-Auth patterns already used in this repo.
  - Preserve behavior except for the vulnerability/slowness being fixed; keep types valid.
  - If, on reading the file, a finding turns out to be wrong or riskier than described, make **no change** and report back why.
  - Return a short summary: what changed, and any follow-up the orchestrator should know.

## Phase 4 — Verify & report

- After all agents finish, run `pnpm typecheck` **once** to confirm nothing broke. Do **not** run `pnpm build`, `pnpm dev`, or `pnpm lint` (a dev server is already running, and lint tends to time out).
- If typecheck fails, fix the type errors directly (or re-spawn an Opus agent for the offending file) until it passes.
- Final report as a table: `file | severity | issue | fix applied | status (fixed / skipped-why)`, followed by the **Suspected** findings I should review manually.

**Constraints:** Only real, verified issues in this codebase — no hypotheticals. Smallest change that fixes each issue; no rewrites of working code. Security outranks performance at equal severity.
