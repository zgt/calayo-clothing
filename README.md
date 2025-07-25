# Calayo Clothing

A custom clothing commission platform built with the T3 Stack, enabling customers to request personalized clothing designs and manage their orders.

## Features

- **Custom Commission Requests**: Users can submit detailed requests for custom clothing designs
- **User Authentication**: Secure Better-Auth system with user profiles and measurements
- **Admin Order Management**: Comprehensive admin interface for managing commissions and orders
- **Instagram Integration**: Media fetching and display from Instagram
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS and Material-UI

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **API**: [tRPC](https://trpc.io) for type-safe endpoints
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: [Better-Auth](https://better-auth.com) for secure user management
- **Styling**: [TailwindCSS](https://tailwindcss.com) + [Material-UI](https://mui.com)
- **Type Safety**: [TypeScript](https://typescriptlang.org) + [Zod](https://zod.dev)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for database
- Better-Auth configured for authentication

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BETTER_AUTH_SECRET=your_better_auth_secret
DATABASE_URL=your_database_url
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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Check code linting
- `npm run format:check` - Check code formatting
- `npm run check` - Run linting and type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── server/api/         # tRPC API routes
├── context/            # React contexts (auth, etc.)
├── trpc/              # tRPC client setup
└── env.js             # Environment variable validation
```
