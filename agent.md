# DSP Workshop 2026 -- Project Architecture & Guidelines

## 1. Project Overview

- **App name**: `dsp-workshop-2026`
- **Stack**: Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase + shadcn (radix-nova)
- **Purpose**: Student skill-sharing and matching platform featuring student profiles, skill matching, session management, gamification, and a social feed.

## 2. Project Structure

```
DSP-Workshop-2026/
├── .env                          # Environment variables (never commit secrets)
├── agent.md                      # This file
├── components.json               # shadcn CLI configuration
├── next.config.ts                # Next.js config with next-intl plugin + React Compiler
├── package.json
├── tsconfig.json                 # Path alias: @/* -> ./src/*
├── postcss.config.mjs            # Tailwind v4 PostCSS plugin
├── eslint.config.mjs             # ESLint flat config
├── docs/
│   └── backend_architecture.md   # Feature & DB design specs
├── messages/
│   ├── en.json                   # English translations
│   └── fr.json                   # French translations
├── src/
│   ├── proxy.ts                  # next-intl middleware (matcher config)
│   ├── app/
│   │   ├── layout.tsx            # Root layout (passthrough)
│   │   ├── page.tsx              # Root redirect
│   │   ├── not-found.tsx         # Root 404
│   │   ├── globals.css           # Tailwind v4 + shadcn theme tokens
│   │   └── [locale]/
│   │       ├── layout.tsx        # Locale layout (providers, font, metadata)
│   │       ├── page.tsx          # Home page
│   │       └── not-found.tsx     # Locale-aware 404
│   ├── components/
│   │   └── ui/                   # shadcn components (auto-generated via CLI)
│   ├── contexts/
│   │   └── tanstack-query-client.tsx  # React Query provider
│   ├── hooks/                    # Custom React hooks
│   ├── i18n/
│   │   ├── routing.ts            # Locale config (en, fr)
│   │   ├── request.ts            # Server-side locale resolver
│   │   └── navigation.ts         # Locale-aware Link, redirect, useRouter, usePathname
│   └── lib/
│       ├── utils.ts              # cn() utility (clsx + tailwind-merge)
│       └── supabase/
│           ├── createSupabaseBrowserClient.ts   # Client-side Supabase client
│           ├── createSupabaseServerClient.ts    # Server-side Supabase client (with cookies)
│           ├── createSupabaseServerAdmin.ts     # Admin Supabase client (bypasses RLS)
│           ├── database.types.ts                # Auto-generated types from Supabase CLI
│           └── README.md                        # Type generation command reference
└── supabase/
    ├── config.toml               # Supabase CLI config (Postgres 17, Realtime enabled)
    ├── functions/                # Edge Functions (Deno)
    └── migrations/               # SQL migrations (single source of truth for schema)
```

## 3. Architecture

### 3.1 Frontend Architecture

- **Framework**: Next.js 16 App Router with React Compiler enabled (`reactCompiler: true` in `next.config.ts`).
- **Styling**: Tailwind CSS v4 with CSS-first configuration via `src/app/globals.css`. There is no `tailwind.config.ts`; all theme tokens are defined as CSS custom properties using `@theme inline` and `:root` / `.dark` selectors.
- **UI Library**: shadcn v4 (radix-nova style). Components live in `src/components/ui/` and must always be installed via the CLI: `npx shadcn@latest add <component>`. Never manually create UI primitives that shadcn already provides.
- **Icons**: Lucide React (`lucide-react`).
- **Toasts**: Sonner via the shadcn `<Toaster />` wrapper.
- **Internationalization**: next-intl v4 with a `[locale]` dynamic route segment. Supported locales are `en` (default) and `fr`. Translation files live in `messages/en.json` and `messages/fr.json`.
- **Routing**: All pages live under `src/app/[locale]/`. For locale-aware navigation, always import from `@/i18n/navigation` which exports `Link`, `redirect`, `useRouter`, `usePathname`, and `getPathname`.
- **State / Caching**: TanStack Query (`@tanstack/react-query`) for server state. Supabase Realtime subscriptions invalidate the query cache in real time; a ~30 minute stale timeout acts as a fallback.
- **Forms**: TanStack Form (`@tanstack/react-form`) combined with Zod (`zod`) for schema validation and error messages.

### 3.2 Backend Architecture (Supabase)

- **Simple CRUD**: Direct Supabase client calls (browser or server) protected by Row Level Security (RLS).
- **Complex logic**: Supabase Edge Functions written in Deno. Any operation that goes beyond a simple CRUD query must be implemented as an edge function.
- **Auth**: Supabase Auth. When a new `auth.users` row is created, database triggers automatically create the corresponding `public.users` and `public.user_roles` rows. Auth user updates (email, phone) are synced to `public.users` via a separate trigger.

### 3.3 Supabase Client Factories

Three client factories exist in `src/lib/supabase/`. Always use the appropriate one:

| Factory | Directive | Use Case |
|---|---|---|
| `createSupabaseBrowserClient()` | `"use client"` | Client components, React hooks, browser-side queries |
| `createSupabaseServerClient()` | `"use server"` | Server components, server actions, API routes (handles cookies for auth) |
| `createSupabaseServerAdmin()` | `"use server"` | Admin operations that bypass RLS (uses `NEXT_PRIVATE_SUPABASE_ADMIN_KEY`) |

### 3.4 Provider Hierarchy

The provider tree is defined in `src/app/[locale]/layout.tsx`:

```
<html lang={locale}>
  <body>
    <TanstackQueryClient>            -- React Query provider
      <NextIntlClientProvider>       -- i18n translations
        {children}
        <Toaster />                  -- Sonner toast notifications
      </NextIntlClientProvider>
      <ReactQueryDevtools />         -- Dev-only query inspector
    </TanstackQueryClient>
  </body>
</html>
```

### 3.5 Database Schema

#### Tables

| Table | Role |
|---|---|
| `academic_levels` | Lookup table for academic levels (bilingual: `name_fr`, `name_en`) |
| `users` | Public user profile, linked to `auth.users` via `auth_id` |
| `user_roles` | User role assignment, enum: `USER`, `ADMIN` |
| `users_skills` | Join table between users and skills (includes `user_skill_level` and description) |
| `users_courses` | Join table between users and courses (includes date range) |
| `users_campuses` | Join table between users and campuses |
| `users_availabilities` | User availability slots (supports recurring days via `week_day_type` enum) |
| `skills` | Lookup table for skills |
| `courses` | Lookup table for courses (bilingual) |
| `campuses` | Lookup table for campuses (bilingual) |
| `friend_pairs` | Confirmed friendship relation between two users |
| `friend_requests` | Pending friend request from one user to another |

#### Enums

| Enum | Values |
|---|---|
| `user_roles_type` | `USER`, `ADMIN` |
| `week_day_type` | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` |

#### Helper Functions

| Function | Purpose |
|---|---|
| `enforce_table_timestamps()` | Trigger function that auto-sets `created_at` on insert and `updated_at` on update, prevents `created_at` modification |
| `handle_new_user()` | Trigger on `auth.users` insert: creates `public.users` + default `public.user_roles` row |
| `handle_user_update()` | Trigger on `auth.users` update: syncs email and phone to `public.users` |
| `is_user_admin()` | Returns `true` if the current authenticated user has the `ADMIN` role |

#### RLS Policy Pattern

- Every table has RLS enabled.
- Users can view/modify their own rows (scoped via `auth_id = auth.uid()` or subquery on `public.users`).
- Lookup tables (academic_levels, skills, courses, campuses) are readable by all authenticated users.
- Admins have full access (`for all`) on every table, gated by `public.is_user_admin()`.

## 4. Coding Conventions

### General

- **Language**: TypeScript in strict mode, target ES2017.
- **Path alias**: `@/*` maps to `./src/*`. Always use this alias for imports.
- **Naming**: Use intention-revealing, pronounceable, and searchable names. No abbreviations, no Hungarian notation, no single-letter variables (except loop counters).
- **No duplicate code**: Before creating a new utility, hook, or component, search the codebase for existing equivalents.

### React

- Use React functional components exclusively.
- Only add the `"use client"` directive when the component requires client-side interactivity (hooks, event handlers, browser APIs). Default to server components.
- Place reusable components in `src/components/`. Page-specific components can live alongside their page.

### Internationalization

- All user-facing text must go through next-intl. Use `useTranslations()` in client components and `getTranslations()` in server components.
- Both `messages/en.json` and `messages/fr.json` must be updated together for every text change.
- Translation keys follow a nested namespace pattern: `Pages.<PageName>.<key>`.

### Supabase

- Always type queries with the generated `Database` type from `@/lib/supabase/database.types`.
- Choose the correct client factory based on execution context (see Section 3.3).
- Never bypass RLS unless strictly necessary; prefer `createSupabaseServerClient()` over `createSupabaseServerAdmin()`.

### UI

- Install shadcn components via CLI (`npx shadcn@latest add <name>`), never create them manually.
- Use the `cn()` utility from `@/lib/utils` for conditional class merging.
- Use Lucide React for icons.

## 5. Development Workflows

### Adding a New Page

1. Create `src/app/[locale]/<route>/page.tsx`.
2. Add the corresponding translation keys to both `messages/en.json` and `messages/fr.json`.
3. If the page needs locale-aware links, import `Link` from `@/i18n/navigation`.

### Installing a shadcn Component

```bash
npx shadcn@latest add <component-name>
```

### Database Changes (tables, RLS, functions)

All database modifications must go through the Supabase CLI in this git repo. Never make schema changes directly in the Supabase dashboard.

1. Create a new migration:
   ```bash
   npx supabase migration new <descriptive_name>
   ```
2. Write SQL in the generated file at `supabase/migrations/<timestamp>_<descriptive_name>.sql`.
3. Follow the existing patterns: UUID primary keys, `created_at`/`updated_at` timestamps, `enforce_table_timestamps()` trigger, RLS enabled, admin full-access policy.
4. Push the migration:
   ```bash
   npx supabase db push
   ```
5. Regenerate TypeScript types:
   ```bash
   npx supabase gen types typescript --project-id "xssbcqscqkplkmjskrnp" --schema public > src/lib/supabase/database.types.ts
   ```
6. Commit both the migration file and the updated `database.types.ts`.

### Adding an Edge Function

1. Scaffold the function:
   ```bash
   npx supabase functions new <function-name>
   ```
2. Implement the logic in `supabase/functions/<function-name>/index.ts`.
3. Deploy:
   ```bash
   npx supabase functions deploy <function-name>
   ```

### Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `NEXT_PRIVATE_SUPABASE_ADMIN_KEY` | Server-only | Supabase service role key (never expose to client) |

### Running the Project

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 6. Critical Rules

1. **Migrations are the source of truth**: All database schema changes (tables, RLS policies, functions, triggers, enums) MUST go through Supabase migration files in this git repo. Never use the Supabase dashboard to modify the schema directly.
2. **RLS on every table**: All tables MUST have Row Level Security enabled with appropriate policies.
3. **Timestamps on every table**: All tables MUST use the `enforce_table_timestamps()` trigger for consistent `created_at` / `updated_at` handling.
4. **Edge functions for complex logic**: Any operation beyond a simple CRUD query must be implemented as a Supabase Edge Function.
5. **Cache invalidation**: Supabase Realtime subscriptions should invalidate TanStack Query cache for live updates. The ~30 minute stale timeout serves as a safety net, not as the primary invalidation strategy.
6. **Translations in pairs**: Every user-facing string must exist in both `messages/en.json` and `messages/fr.json`.
7. **No dashboard-only changes**: Edge functions, storage rules, and auth config changes should be version-controlled whenever possible.
