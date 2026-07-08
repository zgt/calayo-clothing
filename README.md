# Calayo Clothing

A custom clothing commission platform built with the T3 Stack, enabling customers to request personalized clothing designs and manage their orders.

## Features

- **Custom Commission Requests**: Users can submit detailed requests for custom clothing designs with measurements
- **User Authentication**: Better-Auth with email verification, magic links, and role-based admin access
- **Admin Order Management**: Comprehensive admin interface for managing commissions and orders
- **Instagram Integration**: Portfolio media synced from Instagram, cached in the database and re-hosted via UploadThing
- **3D Visualization**: Interactive 3D garment viewer (dress, jacket, pants, shirt) with Draco-compressed models
- **File Uploads**: UploadThing integration for handling commission images and documents
- **Email Integration**: Resend API for transactional emails and notifications
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS and Material-UI
- **Animation**: GSAP and Framer Motion for smooth animations and transitions

## Tech Stack

### Core Framework
- **Framework**: [Next.js 16](https://nextjs.org) with App Router and React 19
- **API**: [tRPC 11](https://trpc.io) for type-safe endpoints
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: [Better-Auth](https://better-auth.com) with the admin plugin
- **Type Safety**: [TypeScript 6](https://typescriptlang.org) + [Zod 4](https://zod.dev)

### UI & Styling
- **Styling**: [TailwindCSS 4](https://tailwindcss.com) + [Material-UI 9](https://mui.com)
- **Components**: Radix UI primitives and Headless UI with custom styling
- **Animations**: [GSAP](https://gsap.com) + [Framer Motion](https://framer.com/motion) + [Lenis](https://lenis.darkroom.engineering) smooth scrolling
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei) (three.js)

### Integrations
- **File Uploads**: [UploadThing](https://uploadthing.com)
- **Email**: [Resend](https://resend.com) for transactional emails
- **Instagram**: Instagram media sync for the portfolio showcase
- **Monitoring**: Vercel Analytics + Speed Insights

## Getting Started

### Prerequisites

- Node.js 22+ (required by the `engines` field)
- [pnpm](https://pnpm.io) 9+
- Supabase project (PostgreSQL database)

### Environment Setup

Create a `.env.local` file in the root directory (see `.env.example`). The schema is validated at build time by `src/env.js`:

```env
# Database & Authentication
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_BETTER_AUTH_URL=your_app_url
BETTER_AUTH_SECRET=your_better_auth_secret

# File Uploads
UPLOADTHING_APP_ID=your_uploadthing_app_id
UPLOADTHING_SECRET=your_uploadthing_secret   # optional
UPLOADTHING_TOKEN=your_uploadthing_token     # optional

# Instagram API
INSTA_USER_ID=your_instagram_user_id
INSTA_ACCESS_TOKEN=your_instagram_access_token

# Email
RESEND_API_KEY=your_resend_api_key
```

Set `SKIP_ENV_VALIDATION=1` to skip validation (useful for Docker builds).

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Commands

- `pnpm dev` - Start development server (Turbopack)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Build and start production server
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Check code linting
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Auto-format code
- `pnpm check` - Run linting and type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── _components/        # Shared components (incl. 3D garment viewer)
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes (auth, tRPC, UploadThing)
│   ├── auth/               # Authentication pages
│   ├── commissions/        # Commission request pages
│   ├── profile/            # User profile pages
│   └── ...                 # Other pages
├── components/             # Reusable UI components
├── context/                # React contexts
├── lib/                    # Utility functions and configs (auth, admin utils)
├── server/
│   ├── api/                # tRPC routers (commissions, instagram, messages, profile)
│   ├── migrations/         # Numbered database migration sets
│   └── sql/                # SQL utilities
├── trpc/                   # tRPC client setup
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── env.js                  # Environment variable validation

emails/                     # Transactional email HTML templates
public/3d-assets/           # Draco-compressed .glb garment models
scripts/                    # Maintenance scripts (3D asset optimization)
```

## Key Features & Integrations

### Authentication
- Better-Auth with secure session management, email verification, and magic links
- User profiles with custom measurements
- Admin role-based access control (`user` / `admin`)

### File Management
- UploadThing integration for commission images
- Draco-compressed 3D garment models (regenerate with `scripts/optimize-3d-assets.sh`)
- HTML email templates in `emails/`

### External APIs
- Instagram media sync for the portfolio showcase
- Resend for transactional emails

### Database
- PostgreSQL via Supabase
- tRPC for type-safe database operations
- Numbered migration sets in `src/server/migrations/`
