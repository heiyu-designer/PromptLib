# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PromptLib is a modern AI prompt management and sharing platform built with Next.js 16, React 19, TypeScript, and Supabase. It provides a full-stack application for managing AI prompts with user authentication, role-based access control, and comprehensive admin functionality.

## Development Commands

```bash
# Start development server on port 30001
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture Overview

### Database Layer (Supabase)
- **Tables**: `profiles`, `prompts`, `tags`, `prompt_tags`, `copy_events`, `settings`
- **RLS (Row Level Security)**: Comprehensive security policies implemented
- **Authentication**: Simple localStorage-based system for development, with Supabase Auth integration ready
- **Key Functions**: `increment_view_count()`, `increment_copy_count()`, admin user management

### Application Structure
- **App Router**: Uses Next.js 16 App Router with TypeScript
- **Server Actions**: Located in `app/actions/` for database operations
- **Authentication Flow**: Dual system - simple localStorage auth (`lib/simple-auth.ts`) + Supabase Auth providers
- **Admin Panel**: Full CRUD operations with role-based access control

### Key Technical Patterns
1. **Dual Authentication**: Simple localStorage-based auth for development (`lib/simple-auth.ts`) with automatic admin promotion in dev environment
2. **Server Actions**: All database operations in `app/actions/` with proper error handling
3. **Type Safety**: Comprehensive TypeScript types in `lib/database.ts` extending Supabase generated types
4. **Component Architecture**: shadcn/ui components with custom business logic components

### Authentication System
The application uses a hybrid authentication approach:

**Development Environment** (`lib/simple-auth.ts`):
- Simple localStorage-based authentication
- Auto-admin promotion with `setDevAdmin()` function
- Hardcoded credentials: `admin` / `admin123`

**Production Environment**:
- Supabase Auth with OAuth providers (GitHub, Google)
- RLS policies enforce data security
- Profile management with role-based access control

### Data Flow Patterns
1. **Client Components**: Use `useAuth()` hook for authentication state
2. **Server Actions**: Direct Supabase admin client access for privileged operations
3. **Public Data**: API routes for client-side data fetching
4. **Admin Operations**: Server Actions with admin role validation

## Development Notes

### Common Issues and Solutions
1. **Server Action Hash Mismatch**: Use API routes instead of Server Actions for client-side data fetching to avoid Next.js build hash issues
2. **supabaseAdmin.raw Error**: Replace with fetch-then-update pattern for increment operations
3. **RLS Policy Conflicts**: Ensure admin user has proper role and status in `profiles` table
4. **Development Authentication**: Use `setDevAdmin()` function for automatic admin access in development

### Database Schema Key Points
- All tables use RLS with role-based access control
- `profiles` table extends Supabase auth.users with role and status
- `prompts` table tracks view_count and copy_count with dedicated increment functions
- `copy_events` table tracks user interaction analytics
- `settings` table stores site-wide configuration as JSONB

### Component Organization
- **Authentication**: `components/auth/` with provider pattern
- **UI Components**: `components/ui/` - shadcn/ui based
- **Business Logic**: `components/home/`, `components/search/`, `components/prompt/`
- **Admin Components**: Mixed in admin routes with server-side data fetching

### Key Files to Understand
1. `lib/simple-auth.ts` - Development authentication system
2. `lib/supabase.ts` - Database client configuration
3. `app/actions/prompts.ts` - Core prompt operations
4. `app/admin/layout.tsx` - Admin panel authentication check
5. `components/home/home-page.tsx` - Main application interface

## Deployment Considerations
- Environment variables must be configured for Supabase integration
- Database schema must be executed in Supabase SQL editor
- OAuth providers need configuration in Supabase Auth settings
- Admin users must be created manually in development or through SQL functions

## Security Architecture
- **RLS Policies**: Comprehensive database-level security
- **Role-Based Access**: User/Admin roles with different privileges
- **Input Validation**: Zod schemas for form validation
- **Development Safeguards**: Auto-admin promotion only in development environment