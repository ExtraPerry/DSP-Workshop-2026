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
├── vitest.config.ts              # Vitest config (jsdom env, path aliases, setup file)
├── vitest.setup.ts               # Test setup (jest-dom matchers)
├── docs/
│   ├── architecture.md           # Feature & DB design specs (source of truth)
│   └── projet_details.md         # Original project brief (French)
├── messages/
│   ├── en.json                   # English translations
│   └── fr.json                   # French translations
├── src/
│   ├── proxy.ts                  # Middleware: Supabase auth route protection + next-intl
│   ├── app/
│   │   ├── layout.tsx            # Root layout (passthrough)
│   │   ├── page.tsx              # Root redirect
│   │   ├── not-found.tsx         # Root 404
│   │   ├── globals.css           # Tailwind v4 + shadcn theme tokens (:root / .dark)
│   │   └── [locale]/
│   │       ├── layout.tsx        # Locale layout (providers, font, metadata)
│   │       ├── not-found.tsx     # Locale-aware 404
│   │       ├── (public)/         # Public pages (PublicHeader, no Navbar)
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx      # Marketing landing page ("/")
│   │       │   ├── about/, contact/, faq/, privacy-policy/, ...
│   │       ├── (main)/           # Authenticated route group (renders Navbar)
│   │       │   ├── layout.tsx
│   │       │   ├── dashboard/
│   │       │   ├── matching/, sessions/, feed/, friends/, profile/, account/, ...
│   │       ├── (admin)/          # Admin route group (Navbar + role gate)
│   │       │   └── admin/        # users, lookups, moderation, gamification, ...
│   │       ├── login/
│   │       │   ├── page.tsx
│   │       │   └── login-form.tsx
│   │       ├── register/
│   │       │   ├── page.tsx
│   │       │   └── register-form.tsx
│   │       └── verify-email/
│   │           └── page.tsx
│   ├── components/
│   │   ├── navbar.tsx            # Main nav (useCurrentUserRole for admin link; UserAccountMenu when signed in)
│   │   ├── public-header.tsx     # Public nav (UserAccountMenu when signed in on public pages)
│   │   ├── user-account-menu.tsx # Shared dropdown: profile, account, sign out
│   │   ├── lookup-combobox.tsx   # Searchable/clearable/creatable lookup selector
│   │   ├── date-time-picker.tsx
│   │   ├── language-switcher.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── admin/                # lookup-table-manager, entity-manager
│   │   └── ui/                   # shadcn components (installed via CLI)
│   ├── contexts/
│   │   ├── tanstack-query-client.tsx  # React Query provider (global staleTime)
│   │   └── theme-provider.tsx         # next-themes provider wrapper
│   ├── hooks/
│   │   ├── use-realtime-query.ts # Canonical TanStack Query + Realtime invalidation
│   │   ├── use-current-user.ts   # Composes useRealtimeQuery + auth listener
│   │   ├── use-current-user-role.ts
│   │   ├── use-user-profile.ts
│   │   ├── use-friendships.ts
│   │   └── use-lookups.ts        # Skills/courses/campuses + create* helpers
│   ├── i18n/
│   │   ├── routing.ts            # Locale config (en, fr)
│   │   ├── request.ts            # Server-side locale resolver
│   │   └── navigation.ts         # Locale-aware Link, redirect, useRouter, usePathname
│   └── lib/
│       ├── utils.ts              # cn() utility (clsx + tailwind-merge)
│       ├── localized-name.ts
│       ├── utils.test.ts         # Example Vitest unit test
│       ├── admin/delete-user.ts  # Server action (service role)
│       ├── friendships/send-friend-request.ts
│       ├── notifications/resolve-notification-text.ts
│       └── supabase/
│           ├── create-supabase-browser-client.ts  # Client-side Supabase client
│           ├── create-supabase-server-client.ts   # Server-side Supabase client (cookies)
│           ├── create-supabase-server-admin.ts    # Admin Supabase client (bypasses RLS)
│           ├── database.types.ts                  # Auto-generated types from Supabase CLI
│           ├── README.md                          # Type generation command reference
│           └── auth/
│               ├── login-with-email.ts            # Server action: sign in
│               ├── register-with-email.ts         # Server action: sign up
│               ├── change-password.ts               # Server action: change password (re-auth)
│               └── logout.ts                       # Server action: sign out
└── supabase/
    ├── config.toml               # Supabase CLI config (Postgres 17, Realtime enabled)
    ├── functions/                # Edge Functions (Deno)
    └── migrations/               # SQL migrations (single source of truth for schema)
```

## 3. Architecture

### 3.1 Frontend Architecture

- **Framework**: Next.js 16 App Router with React Compiler enabled (`reactCompiler: true` in `next.config.ts`).
- **Styling**: Tailwind CSS v4 with CSS-first configuration via `src/app/globals.css`. There is no `tailwind.config.ts`; all theme tokens are defined as CSS custom properties using `@theme inline` and `:root` / `.dark` selectors.
- **Theming / dark mode**: `next-themes`. The `ThemeProvider` wrapper lives in `src/contexts/theme-provider.tsx` and is mounted in the locale layout with `attribute="class"`, `defaultTheme="light"`, and `enableSystem`. User choice is persisted in localStorage. Always style with semantic theme tokens; never hardcode raw colors.
- **UI Library**: shadcn v4 (radix-nova style). Components live in `src/components/ui/` and must always be installed via the CLI: `npx shadcn@latest add <component>`. Never manually create UI primitives that shadcn already provides.
- **Icons**: Lucide React (`lucide-react`).
- **Toasts**: Sonner via the shadcn `<Toaster />` wrapper.
- **Internationalization**: next-intl v4 with a `[locale]` dynamic route segment. Supported locales are `en` and `fr` (`defaultLocale: "fr"` in `src/i18n/routing.ts`). The user's locale is persisted in the `NEXT_LOCALE` cookie when they switch language. Translation files live in `messages/en.json` and `messages/fr.json`.
- **Routing**: All pages live under `src/app/[locale]/`. For locale-aware navigation, always import from `@/i18n/navigation` which exports `Link`, `redirect`, `useRouter`, `usePathname`, and `getPathname`.
- **State / Caching**: TanStack Query (`@tanstack/react-query`) for server state. A global default `staleTime` of 30 minutes is configured on the `QueryClient` in `src/contexts/tanstack-query-client.tsx`. Supabase Realtime subscriptions invalidate the query cache in real time; the 30 minute stale timeout acts as a fallback.
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
<html lang={locale} suppressHydrationWarning>
  <body>
    <TanstackQueryClient>              -- React Query provider (global staleTime)
      <NextIntlClientProvider>         -- i18n translations
        <ThemeProvider>                -- next-themes (light / dark / system)
          {children}
          <Toaster />                  -- Sonner toast notifications
        </ThemeProvider>
      </NextIntlClientProvider>
      <ReactQueryDevtools />           -- Dev-only query inspector
    </TanstackQueryClient>
  </body>
</html>
```

### 3.5 Database Schema

#### Tables

| Table | Role |
|---|---|
| `academic_levels` | Lookup table for academic levels (bilingual: `name_fr`, `name_en`) |
| `users` | Public user profile, linked to `auth.users` via `auth_id` (includes free-text `bio`) |
| `user_roles` | User role assignment, enum: `USER`, `ADMIN` |
| `users_skills` | Join table between users and skills (includes `user_skill_level` and description) |
| `users_courses` | Join table between users and courses (includes date range) |
| `users_campuses` | Join table between users and campuses |
| `users_availabilities` | User availability slots (supports recurring days via `week_day_type` enum) |
| `skills` | Lookup table for skills (user-proposable; `is_verified` flag + `created_by_user_id`) |
| `courses` | Lookup table for courses (bilingual; user-proposable; `is_verified` + `created_by_user_id`) |
| `campuses` | Lookup table for campuses (bilingual; user-proposable; `is_verified` + `created_by_user_id`) |
| `friend_pairs` | Confirmed friendship relation between two users |
| `friend_requests` | Pending friend request from one user to another |
| `direct_conversations` | One direct-message thread per confirmed friendship (`friend_pair_id`) |
| `direct_messages` | Messages within a friend direct-message conversation |
| `match_requests` | Records a match attempt from one user to another for a specific skill |
| `match_history` | Records completed/resolved match interactions for analytics and feedback |
| `session_types` | Extensible lookup table for session categories (workshop, quick course, thematic club, etc.) |
| `sessions` | A scheduled learning session organized by a user |
| `session_participants` | Join table tracking who attends each session and in what role |
| `badges` | Lookup table of all available badges that users can earn |
| `user_badges` | Tracks which badges a user has earned |
| `point_actions` | Lookup table defining how many points each type of action awards |
| `user_points_ledger` | Append-only log of all points earned (total = SUM) |
| `challenges` | System-defined challenges (quests) that users can complete for rewards |
| `user_challenges` | Tracks individual user progress toward each challenge |
| `posts` | Social feed posts (achievements, recommendations, feedback) |
| `post_likes` | Likes on posts (one per user per post) |
| `post_comments` | Comments on posts |
| `post_shares` | Shares/reposts of posts |
| `notifications` | In-app notification system (created by edge functions or triggers) |
| `content_reports` | User-submitted reports on posts or comments for moderation review |

#### Enums

| Enum | Values |
|---|---|
| `user_roles_type` | `USER`, `ADMIN` |
| `week_day_type` | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` |
| `match_request_status_type` | `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED` |
| `match_outcome_type` | `COMPLETED`, `EXPIRED`, `WITHDRAWN` |
| `session_status_type` | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `session_participant_role_type` | `ORGANIZER`, `TEACHER`, `LEARNER` |
| `challenge_status_type` | `IN_PROGRESS`, `COMPLETED`, `FAILED`, `EXPIRED` |
| `post_type` | `ACHIEVEMENT`, `RECOMMENDATION`, `FEEDBACK` |
| `post_visibility_type` | `PUBLIC`, `FRIENDS_ONLY` |
| `notification_type` | `MATCH_REQUEST`, `MATCH_ACCEPTED`, `SESSION_INVITE`, `SESSION_REMINDER`, `BADGE_EARNED`, `CHALLENGE_COMPLETED`, `FRIEND_REQUEST`, `POST_LIKE`, `POST_COMMENT`, `POST_SHARE`, `ADMIN_BROADCAST`, `ACCOUNT_SUSPENDED`, `CONTENT_REMOVED`, `DIRECT_MESSAGE` |
| `report_status_type` | `PENDING`, `RESOLVED`, `DISMISSED` |

#### Edge Functions

| Function | Purpose |
|---|---|
| `match-students` | Compute and return ranked match suggestions for a user based on complementary skill levels and shared campuses |
| `award-points` | Insert points ledger entry, check badges, update challenge progress after qualifying actions |
| `check-badge-criteria` | Evaluate badge rules against user activity and award newly-met badges |

#### Helper Functions

| Function | Purpose |
|---|---|
| `enforce_table_timestamps()` | Trigger function that auto-sets `created_at` on insert and `updated_at` on update, prevents `created_at` modification |
| `handle_new_user()` | Trigger on `auth.users` insert: creates `public.users` + default `public.user_roles` row |
| `handle_user_update()` | Trigger on `auth.users` update: syncs email and phone to `public.users` |
| `is_user_admin()` | Returns `true` if the current authenticated user has the `ADMIN` role |
| `is_user_in_friend_pair(pair_id)` | Returns `true` if the current authenticated user is either side of the given `friend_pairs` row |
| `format_user_notification_label(user_id)` | Returns sender label as `first_name` + `.` + last-name initial (e.g. `Pierre.M`) for notifications |
| `notify_direct_message_recipient()` | Trigger function: inserts a `DIRECT_MESSAGE` notification for the recipient when a direct message is sent |

#### RLS Policy Pattern

- Every table has RLS enabled.
- Users can view/modify their own rows (scoped via `auth_id = auth.uid()` or subquery on `public.users`).
- Lookup tables (academic_levels, skills, courses, campuses, session_types, badges, point_actions, challenges) are readable by all authenticated users.
- Authenticated users may propose new `skills`, `courses`, and `campuses` (insert with `created_by_user_id = self` and `is_verified = false`); they cannot self-verify. Admins verify by setting `is_verified = true`. Unverified types are visible to everyone (flagged in the UI).
- Sessions, posts (with visibility rules), leaderboard data are readable by all authenticated users.
- FRIENDS_ONLY posts are only visible to the author's friends (resolved via `friend_pairs`).
- Admins have full access (`for all`) on every table, gated by `public.is_user_admin()`.
- Only edge functions (via service role) can INSERT into `user_points_ledger` and `user_badges`.

### 3.6 Authentication & Route Protection

- **Middleware (`src/proxy.ts`)**: This file is the single entry point for both auth gating and i18n. It builds a Supabase server client from the request cookies, calls `supabase.auth.getUser()`, and:
  - Redirects **unauthenticated** users to `/login` for any route not in `PUBLIC_ROUTES`.
  - Redirects **authenticated** users away from auth routes (`/login`, `/register`, `/verify-email`, defined in `AUTH_ROUTES`) to `/dashboard`.
  - Otherwise delegates to the next-intl middleware, forwarding refreshed auth cookies on every response.
- **Public routes**: defined by the `PUBLIC_ROUTES` constant in `src/proxy.ts` (`/`, `/login`, `/register`, `/verify-email`, `/privacy-policy`, `/terms-of-service`, `/legal-notice`, `/accessibility`, `/contact`, `/about`, `/faq`). Add any new unauthenticated route here.
- **Auth routes**: defined by the `AUTH_ROUTES` constant in `src/proxy.ts` (`/login`, `/register`, `/verify-email`). Authenticated users visiting these are redirected to `/dashboard`.
- **Default authenticated page**: `/dashboard` is the home dashboard logged-in users land on (after login and from the navbar logo/home link). The `/` route is a **public** marketing landing page under `(public)/` (hero, feature cards, login/register CTAs).
- **Admin routes**: routes starting with `/admin` are protected by an additional middleware check in `src/proxy.ts` that queries the `user_roles` table and redirects non-admin users to `/dashboard`.
- **Auth server actions**: live in `src/lib/supabase/auth/` (`login-with-email.ts`, `register-with-email.ts`, `change-password.ts`, `logout.ts`). They use `"use server"` and the server Supabase client. UI never calls `supabase.auth.*` directly for sign-in/up/out/password change -- it calls these actions.
- **User account menu**: `src/components/user-account-menu.tsx` is shared by `navbar.tsx` and `public-header.tsx`. Signed-in users get a dropdown (Profile, Account, Sign out) instead of a standalone logout control.
- **Current user on the client**: use the `useCurrentUser` hook (`src/hooks/use-current-user.ts`). It listens to `onAuthStateChange` and a Realtime channel, and exposes the `public.users` row via TanStack Query under `CURRENT_USER_QUERY_KEY`. After login/logout, invalidate or reset that key (see `login-form.tsx` and `user-account-menu.tsx`).
- **Auth → profile sync**: handled in the database, not the app. `handle_new_user()` creates the `public.users` + `public.user_roles` rows on sign-up; `handle_user_update()` syncs email/phone.

## 4. Coding Conventions

### General

- **Language**: TypeScript in strict mode, target ES2017.
- **Path alias**: `@/*` maps to `./src/*`. Always use this alias for imports.
- **Naming quality**: Use intention-revealing, pronounceable, and searchable names. No abbreviations, no Hungarian notation, no single-letter variables (except loop counters).
- **No duplicate code**: Before creating a new utility, hook, or component, search the codebase for existing equivalents.

#### Naming Conventions (casing)

| Subject | Casing | Example |
|---|---|---|
| File names (all files) | kebab-case | `login-form.tsx`, `use-current-user.ts`, `create-supabase-server-client.ts` |
| React component symbols | PascalCase | `function LoginForm() {}`, `export function Navbar() {}` |
| TypeScript variables | camelCase | `const currentUser`, `let displayName` |
| TypeScript functions | camelCase | `function fetchCurrentUser()`, `formatDisplayName()` |
| TypeScript types & interfaces | PascalCase | `type UserProfile`, `interface AuthResult` |
| Zod schemas | PascalCase | `const LoginSchema = z.object(...)` |
| Routes (App Router segment folders) | kebab-case | `verify-email/`, `reset-password/` |
| Edge function names | kebab-case | `match-students`, `send-invite` |
| Database tables & columns | snake_case | `user_roles`, `created_at`, `auth_id` |

- **shadcn components keep their default naming** (kebab-case files such as `button.tsx`, PascalCase exports). Do not rename them.
- **Framework-mandated files keep their required names**: `page.tsx`, `layout.tsx`, `not-found.tsx`, etc. The generated `database.types.ts` and tooling config files (`vitest.config.ts`, `next.config.ts`) also keep their conventional names.
- A React component file uses a kebab-case filename but still exports a PascalCase symbol (e.g. `login-form.tsx` exports `LoginForm`) -- JSX requires the component identifier to be PascalCase.

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

- **shadcn-first components**: Any new component you build MUST start from a shadcn component whenever shadcn provides an equivalent. Before writing a component from scratch, check whether shadcn offers a matching primitive (button, dialog, form, table, card, dropdown, etc.). If it does, install it via the CLI and compose your component on top of it rather than reimplementing the primitive.
- Install shadcn components via CLI (`npx shadcn@latest add <name>`), never create them manually.
- Only build a fully custom component when shadcn has no equivalent for the primitive you need.
- Use the `cn()` utility from `@/lib/utils` for conditional class merging.
- Use Lucide React for icons.

### Data Fetching (TanStack Query + Realtime)

- Server-state data hooks live in `src/hooks/`, one hook per resource (e.g. `use-current-user.ts`).
- Export the query key as a named constant (e.g. `CURRENT_USER_QUERY_KEY`) so callers invalidate/reset the same key instead of duplicating the array literal.
- The canonical realtime primitive is `src/hooks/use-realtime-query.ts` (TanStack Query + `postgres_changes` invalidation). Resource hooks (e.g. `use-current-user.ts`) compose it and add auth-specific listeners where needed.
- The global default `staleTime` (30 min, set on the `QueryClient`) is the safety-net fallback; Realtime invalidation is the primary freshness mechanism (Critical Rule #5).
- Mutations should run through Supabase client calls (or server actions / edge functions for complex logic) and then invalidate the affected query keys.

### Forms (TanStack Form + Zod)

The canonical pattern is `src/app/[locale]/login/login-form.tsx` (and `register-form.tsx`):

- Build forms with `@tanstack/react-form` (`useForm`), composed on top of the shadcn `Field` / `FieldLabel` / `FieldError` and `Input` primitives.
- Validate per field with Zod inside `validators.onBlur`; messages come from i18n keys under `Pages.<PageName>.errors.*`.
- Surface submission/server errors with Sonner (`toast.error`), and gate the submit `Button` with `form.Subscribe` on `canSubmit` / `isSubmitting`.
- Keep submit handlers thin: call an auth server action or a Supabase mutation, then navigate / invalidate query cache.

### Testing (Vitest + React Testing Library)

- The test stack is **Vitest** + **React Testing Library**. Config lives in `vitest.config.ts` (jsdom environment, `@/*` path resolution, `vitest.setup.ts` for `jest-dom` matchers).
- Co-locate tests next to the code under test using the `*.test.ts` / `*.test.tsx` suffix (e.g. `src/lib/utils.test.ts`).
- Run tests with `npm test` (watch) or `npm run test:run` (single run, used in CI).

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
4. Verify the RLS policies: confirm that every affected table has RLS enabled and that its policies are correct and complete (own-row access, lookup-table read access, admin full-access via `public.is_user_admin()`).
5. Give every table its own description using `comment on table <table_name> is '<description>';`. Every table must have a meaningful comment describing its role.
6. Push the migration:
   ```bash
   npx supabase db push
   ```
7. Regenerate TypeScript types:
   ```bash
   npx supabase gen types typescript --project-id "xssbcqscqkplkmjskrnp" --schema public > src/lib/supabase/database.types.ts
   ```
8. Commit both the migration file and the updated `database.types.ts`.
9. Update `agent.md` to reflect the change: keep Section 3.5 (Database Schema -- tables, enums, helper functions, RLS patterns) accurate so the documentation always matches the live backend.

Edge functions are always managed through the Supabase CLI -- scaffolding, dependency declaration, and deployment. Never create or upload an edge function manually through the dashboard.

1. Scaffold the function via the CLI:
   ```bash
   npx supabase functions new <function-name>
   ```
2. Implement the logic in `supabase/functions/<function-name>/index.ts`.
3. Declare all TypeScript/Deno module dependencies in the function's `deno.json` file (import map). Do not import dependencies via inline URLs in the source files -- they must be defined in `deno.json`.
4. Put code shared across functions (CORS headers, common helpers, shared types) in `supabase/functions/_shared/` and import it from there. Any function invoked from the browser must return appropriate CORS headers (handle the `OPTIONS` preflight) using the shared helper.
5. Deploy (upload) the function through the CLI:
   ```bash
   npx supabase functions deploy <function-name>
   ```
6. Update `agent.md` to document the new edge function and its purpose so the documentation stays in sync with the backend.

### Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site URL for sitemap, robots, and metadata (e.g. `http://localhost:3000` in dev) |
| `NEXT_PRIVATE_SUPABASE_ADMIN_KEY` | Server-only | Supabase service role key (never expose to client) |

### Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with the variables listed under **Environment Variables** below.
3. Link the local project to the Supabase project (once):
   ```bash
   npx supabase link --project-ref xssbcqscqkplkmjskrnp
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

### Running the Project

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run Vitest in watch mode
npm run test:run  # Run Vitest once (CI)
```

## 6. Critical Rules

1. **Migrations are the source of truth**: All database schema changes (tables, RLS policies, functions, triggers, enums) MUST go through Supabase migration files in this git repo. Never use the Supabase dashboard to modify the schema directly.
2. **RLS on every table**: All tables MUST have Row Level Security enabled with appropriate policies.
3. **Timestamps on every table**: All tables MUST use the `enforce_table_timestamps()` trigger for consistent `created_at` / `updated_at` handling.
4. **Edge functions for complex logic**: Any operation beyond a simple CRUD query must be implemented as a Supabase Edge Function.
5. **Cache invalidation**: Supabase Realtime subscriptions should invalidate TanStack Query cache for live updates. The ~30 minute stale timeout serves as a safety net, not as the primary invalidation strategy.
6. **Translations in pairs**: Every user-facing string must exist in both `messages/en.json` and `messages/fr.json`.
7. **No dashboard-only changes**: Edge functions, storage rules, and auth config changes should be version-controlled whenever possible.
8. **shadcn-first components**: Every component you build MUST start from a shadcn component when shadcn has an equivalent. Only build a component from scratch when no shadcn primitive exists for it.
9. **Edge functions via CLI only**: Edge functions MUST be scaffolded, have their dependencies declared in `deno.json`, and be deployed/uploaded exclusively through the Supabase CLI -- never manually through the dashboard.
10. **Regenerate types after backend changes**: Whenever the Supabase backend changes (schema, RLS, functions, enums, edge functions affecting the public schema), regenerate `src/lib/supabase/database.types.ts` using the command in `src/lib/supabase/README.md`, and commit the updated types.
11. **Verify RLS on schema changes**: Whenever the database schema changes, verify that RLS is enabled and the policies are correct and complete on every affected table.
12. **Describe every table**: Every table MUST have its own description set via `comment on table <table_name> is '<description>';`.
13. **Document backend changes in agent.md**: Any backend change (schema, RLS, functions, triggers, enums, edge functions) MUST be reflected in `agent.md` so its documentation always matches the live backend.
14. **Naming casing**: File names are kebab-case; React component symbols are PascalCase; TS variables/functions are camelCase; TS types and Zod schemas are PascalCase; routes and edge function names are kebab-case; DB tables and columns are snake_case (see Section 4 → Naming Conventions). shadcn and framework-mandated files keep their default names.
15. **Theme tokens, not hardcoded colors**: Always style with semantic theme tokens (`bg-background`, `text-foreground`, `bg-primary`, etc.) so light and dark themes stay consistent. Never hardcode raw color values.
