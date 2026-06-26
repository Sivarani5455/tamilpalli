# Tamil Horizon

Tamil Horizon is a commercial-ready Next.js starter for a Tamil learning platform with multilingual UI, subscription-aware content, Supabase schema files and demo game flows.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth / Database / Storage scaffolding
- Vercel-ready deployment structure
- Stripe-ready subscription data model

## Included

- Localized routing: `/en`, `/ta`, `/fr`, `/de`, `/da`, `/no`, `/it`
- Landing page, pricing, dashboard, auth screens
- Admin area routes for users, content, Word Search, Fill in the Blanks and Image Hunt
- Demo game components for all three learning modes
- Supabase SQL schema, seed data and RLS starter policies

## Configure Supabase

1. Copy `.env.example` to `.env.local`.
2. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Run the SQL files in `supabase/migrations`, then `supabase/rls.sql`, then `supabase/seed.sql`.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add the same environment variables from `.env.local`.
4. Configure your Supabase redirect URLs to match the Vercel domain.

## Next implementation steps

- Replace demo auth helpers with live Supabase session checks.
- Persist scores and attempts to Supabase from the three game clients.
- Add Stripe checkout and webhook handling.
- Expand the admin placeholders into full CRUD forms with server actions.
