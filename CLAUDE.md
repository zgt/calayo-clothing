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

This is a T3 Stack application (Next.js + tRPC + Supabase) for Calayo Clothing, a custom clothing commission platform.

### Core Technologies
- **Next.js 15** with App Router
- **tRPC** for type-safe API endpoints (`src/server/api/`)
- **Better-Auth** for authentication with admin roles
- **Supabase/PostgreSQL** for database
- **TailwindCSS 4 + Material-UI** for styling
- **TypeScript** with strict configuration
- **Zod** for runtime validation
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
- tRPC routers in `src/server/api/routers/` (commissions, instagram, profile, jobs)
- Main router in `src/server/api/root.ts`
- Client-side tRPC setup in `src/trpc/`
- Middleware for auth, admin, and timing

**Environment Variables**:
- Managed through `@t3-oss/env-nextjs` in `src/env.js`
- Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Required: `INSTA_USER_ID`, `INSTA_ACCESS_TOKEN`, `UPLOADTHING_APP_ID`
- Required: `RESEND_API_KEY`, `APIFY_API_KEY`, `OPENAI_API_KEY`
- Required: `GOOGLE_SHEETS_SERVICE_ACCOUNT`, `GOOGLE_SHEETS_SPREADSHEET_ID`
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
- Job automation (web scraping, OpenAI processing, Google Sheets integration)
- File uploads for commission images and documents
- 3D garment visualization (dress, jacket, pants, shirt models)
- Email notifications and transactional messaging

### Important Notes

- Uses path alias `~/*` for `./src/*`
- Better-Auth replaces Supabase auth (database still uses Supabase PostgreSQL)
- tRPC procedures: `publicProcedure`, `protectedProcedure`, `adminProcedure`
- Email templates stored as HTML files in `/emails` directory
- 3D models use GLTF format with textures in `public/3d-assets/`
- Job processing system with automated workflows

### Claude Guidance
- Never add information about claude in the commit messages, that includes made by claude or helped by claude.
- Never include this information: 🤖 Generated with [Claude Code](https://claude.ai/code)                                                           Co-Authored-By: Claude <noreply@anthropic.com>
- Commit changes with descriptive message
- don't run npm run lint after every change, it tends to timeout