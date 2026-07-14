# Portray MVP

Portray turns a resume or LinkedIn source plus one representative work into an editable, evidence-constrained AI Talent Passport. The MVP supports agentic profile intake, selective-beta context, email magic-link ownership, private sharing, Ask My Passport, feedback, and admin review.

## Local development

```bash
npm install
npm run dev
```

Without environment variables the app uses the deterministic AI adapter and `data/portrait-store.json`. This mode is intended for local product testing only.

## Beta configuration

1. Create a Supabase project and run `supabase/migrations/001_portray_mvp.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and set Supabase, Formspree, site URL, AI Gateway, admin email, and IP hash salt values.
3. Add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to Supabase Auth redirect URLs.
4. Deploy to Vercel. In production, use `PORTRAY_AI_MODE=real`; missing AI credentials then produce an explicit retryable generation failure.

Existing local demo records can be imported idempotently after exporting the Supabase variables:

```bash
npm run migrate:supabase
```

## Verification

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

PDF export, public indexing, payments, and an employer search dashboard remain outside v0.1.
