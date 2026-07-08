# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `pnpm dev` (uses turbo mode)
- **Build application**: `pnpm build`
- **Type checking**: `pnpm typecheck` or `tsc --noEmit`
- **Linting**: `pnpm lint` (check) or `pnpm lint:fix` (auto-fix)
- **Format code**: `pnpm format:check` (check) or `pnpm format:write` (apply)
- **Full check**: `pnpm check` (combines linting and type checking)
- **Preview production build**: `pnpm preview`

## Architecture Overview

This is a T3 Stack application (Next.js 16 + tRPC + Supabase) for Calayo Clothing, a custom clothing commission platform.

### Core Technologies
- **Next.js 16** with App Router (React 19, Node ≥22, pnpm)
- **tRPC v11** for type-safe API endpoints (`src/server/api/`)
- **Better-Auth** for authentication with admin roles
- **Supabase/PostgreSQL** for database (accessed via `@supabase/supabase-js` and `pg`)
- **TailwindCSS 4 + Material-UI v9** for styling
- **TypeScript** with strict configuration
- **Zod v4** for runtime validation
- **React Three Fiber + Drei** for 3D graphics
- **GSAP + Framer Motion** for animations
- **UploadThing** for file uploads
- **Resend** for transactional emails

### Key Architecture Patterns

**Authentication Flow**:
- Better-Auth with admin plugin (`src/lib/auth.ts`)
- Client setup in `src/lib/auth-client.ts`
- Role-based access control (user/admin)
- Email verification and magic link support

**API Layer**:
- tRPC routers in `src/server/api/routers/` (commissions, instagram, profile, messages)
- Main router in `src/server/api/root.ts`
- Client-side tRPC setup in `src/trpc/`
- Middleware for auth, admin, and timing

**Environment Variables**:
- Managed through `@t3-oss/env-nextjs` in `src/env.js`
- Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Required: `INSTA_USER_ID`, `INSTA_ACCESS_TOKEN`, `UPLOADTHING_APP_ID`
- Required: `RESEND_API_KEY`
- Optional: `UPLOADTHING_SECRET`, `UPLOADTHING_TOKEN`
- **Note**: Create `.env.local` file with these variables before running dev/build commands

**File Structure**:
- App Router pages in `src/app/`
- Shared components in `src/app/_components/` (including 3D models, UI components)
- Page-specific components in `src/app/[page]/_components/`
- Server API routers in `src/server/api/routers/`
- Database migrations in `src/server/migrations/`
- Client contexts in `src/context/`
- Utility libraries in `src/lib/`
- Email templates in `emails/`
- 3D assets in `public/3d-assets/`

### Business Domain

The app handles:
- Custom clothing commission requests with measurements
- User authentication with role-based admin access
- Order management with status tracking
- Instagram media integration for portfolio showcase
- File uploads for commission images and documents
- 3D garment visualization (dress, jacket, pants, shirt models)
- Email notifications and transactional messaging

### Important Notes

- Uses path alias `~/*` for `./src/*`
- Better-Auth replaces Supabase auth (database still uses Supabase PostgreSQL)
- tRPC procedures: `publicProcedure`, `protectedProcedure`, `adminProcedure`
- Email templates stored as HTML files in `/emails` directory
- 3D models are Draco-compressed `.glb` files in `public/3d-assets/` (decoder self-hosted in `public/draco/`; uncompressed originals archived outside the repo; regenerate with `scripts/optimize-3d-assets.sh`)

### Claude Guidance

**Working principles**
- Ask, don't assume. If intent, architecture, or requirements are unclear, clarify before writing code. When running unattended, pick the most reasonable interpretation, proceed, and record the assumption rather than blocking.
- Implement the simplest solution that fits the problem. Don't over-engineer or add flexibility that isn't needed yet.
- Don't touch unrelated code — but surface bad code or design smells you find so they can be addressed separately.
- Flag uncertainty explicitly instead of asserting with false confidence.
- Suggest better approaches when you see them, including ones with long-lasting impact over a tactical fix.

**Subagent workflows**
- Delegate by default. Keep the main context as orchestrator/reviewer: plan, dispatch subagents, judge their output, integrate.
- Use subagents (e.g. Explore) for codebase search/exploration so file dumps stay out of the main context.
- Hand well-specified, independent changes to subagents; fan out concurrent agents in a single message when the work doesn't conflict.
- Before landing nontrivial work, get an independent, fresh-context review.
- Give subagents self-contained prompts (goal, constraints, paths, expected output) and carry over "don't touch unrelated code" and "record assumptions instead of blocking".

**Git**
- Keep commit messages concise.
- Never add Claude attribution to commits — no "made by Claude"/"helped by Claude", no `Co-Authored-By: Claude ...`, no `🤖 Generated with [Claude Code]`.

**Development**
- A dev server is usually already running. Don't run `pnpm build` or `pnpm dev` after making changes unless asked.
- Don't run `pnpm lint` after every change — it tends to time out. Use `pnpm typecheck` for a fast check.