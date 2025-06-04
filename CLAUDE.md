# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses turbo mode)
- **Build application**: `npm run build`
- **Type checking**: `npm run typecheck` or `tsc --noEmit`
- **Linting**: `npm run lint` (check) or `npm run lint:fix` (auto-fix)
- **Format code**: `npm run format:check` (check) or `npm run format:write` (apply)
- **Full check**: `npm run check` (combines linting and type checking)
- **Preview production build**: `npm run preview`

## Architecture Overview

This is a T3 Stack application (Next.js + tRPC + Supabase) for Calayo Clothing, a custom clothing commission platform.

### Core Technologies
- **Next.js 15** with App Router
- **tRPC** for type-safe API endpoints (`src/server/api/`)
- **Supabase** for authentication and database
- **TailwindCSS + Material-UI** for styling
- **TypeScript** with strict configuration
- **Zod** for runtime validation

### Key Architecture Patterns

**Authentication Flow**: 
- Supabase auth with custom React context (`src/context/auth.tsx`)
- Auth provider wraps the app and manages user state
- Protected routes use the `useAuth()` hook

**API Layer**:
- tRPC routers in `src/server/api/routers/`
- Main router in `src/server/api/root.ts`
- Client-side tRPC setup in `src/trpc/`

**Environment Variables**:
- Managed through `@t3-oss/env-nextjs` in `src/env.js`
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-only: `ADMIN_ID` (for admin user verification)
- Optional: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Note**: Create `.env.local` file with these variables before running dev/build commands

**File Structure**:
- App Router pages in `src/app/`
- Shared components in `src/app/_components/`
- Page-specific components in `src/app/[page]/_components/`
- Server-side utilities in `src/server/`
- Client contexts in `src/context/`

### Business Domain

The app handles:
- User authentication and profiles
- Commission requests and management
- Admin order management
- Instagram media integration
- Google Maps integration for outdoor features
- User measurements and custom clothing orders

### Important Notes

- Uses path alias `~/*` for `./src/*`
- Supabase client utilities separated by environment (client/server/middleware)
- Instagram API integration for media fetching
- Material-UI with Emotion for component styling

### Claude Guidance
- Never add information about claude in the commit messages