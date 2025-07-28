# Calayo Clothing

A custom clothing commission platform built with the T3 Stack, enabling customers to request personalized clothing designs and manage their orders.

## Features

- **Custom Commission Requests**: Users can submit detailed requests for custom clothing designs with measurements
- **User Authentication**: Secure Better-Auth system with user profiles and custom measurements
- **Admin Order Management**: Comprehensive admin interface for managing commissions and orders
- **Instagram Integration**: Media fetching and display from Instagram API
- **3D Visualization**: Interactive 3D dress models and assets for enhanced user experience
- **File Uploads**: UploadThing integration for handling commission images and documents
- **Email Integration**: Resend API for transactional emails and notifications
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS and Material-UI
- **Animation**: GSAP and Framer Motion for smooth animations and transitions

## Tech Stack

### Core Framework
- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **API**: [tRPC](https://trpc.io) for type-safe endpoints
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: [Better-Auth](https://better-auth.com) for secure user management
- **Type Safety**: [TypeScript](https://typescriptlang.org) + [Zod](https://zod.dev)

### UI & Styling
- **Styling**: [TailwindCSS 4](https://tailwindcss.com) + [Material-UI](https://mui.com)
- **Components**: Radix UI primitives with custom styling
- **Animations**: [GSAP](https://gsap.com) + [Framer Motion](https://framer.com/motion)
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei)

### Integrations
- **File Uploads**: [UploadThing](https://uploadthing.com)
- **Email**: [Resend](https://resend.com) for transactional emails
- **Instagram**: Instagram Basic Display API
- **Maps**: Google Maps integration
- **Monitoring**: Vercel Speed Insights

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for database
- Better-Auth configured for authentication

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BETTER_AUTH_URL=your_better_auth_url
BETTER_AUTH_SECRET=your_better_auth_secret
DATABASE_URL=your_database_connection_string

# File Uploads
UPLOADTHING_APP_ID=your_uploadthing_app_id
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_TOKEN=your_uploadthing_token

# Instagram API
INSTA_USER_ID=your_instagram_user_id
INSTA_ACCESS_TOKEN=your_instagram_access_token

# Email
RESEND_API_KEY=your_resend_api_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Commands

- `npm run dev` - Start development server (with Turbo mode)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Build and start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Check code linting
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format:check` - Check code formatting
- `npm run format:write` - Auto-format code
- `npm run check` - Run linting and type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── _components/        # Shared components
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── commissions/       # Commission request pages
│   ├── profile/           # User profile pages
│   └── ...               # Other pages
├── components/            # Reusable UI components
├── context/              # React contexts (auth, etc.)
├── lib/                  # Utility functions and configs
├── server/
│   ├── api/              # tRPC API routes and routers
│   ├── migrations/       # Database migrations
│   └── sql/              # SQL utilities
├── trpc/                 # tRPC client setup
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── env.js                # Environment variable validation
```

## Key Features & Integrations

### Authentication
- Better-Auth setup with secure session management
- User profiles with custom measurements
- Admin role-based access control

### File Management
- UploadThing integration for commission images
- 3D asset management for dress models
- Email template management

### External APIs
- Instagram Basic Display API for media showcase
- Google Maps integration (optional)
- Resend for transactional emails

### Database
- PostgreSQL via Supabase
- tRPC for type-safe database operations
- Migration system for schema updates
