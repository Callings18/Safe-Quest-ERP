# SAFEQUEST ERP

Zambia-focused ERP for construction, solar, and lending. Frontend is Vite + React. Backend is **Supabase**: Postgres, Auth, Storage, Row Level Security, RPCs, and Edge Functions.

## Stack

- **Database / Auth / Storage / Realtime**: Supabase Postgres
- **Business logic**: Postgres RPCs (`record_invoice_payment`, `generate_loan_schedule`, `next_document_number`) plus Edge Functions (`process-payroll`, `record-payment`, `generate-loan-schedule`)
- **App**: React 18, TanStack Query, shadcn/ui

The first user who signs up becomes **admin**. Later users get a `sales` role so they can work in the system; an admin can change roles in Settings.

## Local run

```sh
npm install
copy .env.example .env
```

Put your Supabase URL and anon key in `.env`, then:

```sh
npm run dev
```

Open http://127.0.0.1:8080

## Point this app at your own Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor (or `supabase db push` with the CLI linked), apply everything under `supabase/migrations/`.
3. Copy Project URL and anon key into `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
4. Deploy functions:

```sh
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase db push
npx supabase functions deploy process-payroll
npx supabase functions deploy record-payment
npx supabase functions deploy generate-loan-schedule
```

5. In Auth settings, add your production URL to **Redirect URLs** and **Site URL**. Disable email confirmations for internal staff if you want instant login.

## Host the frontend

Build with `npm run build`. Serve the `dist` folder on Cloudflare Pages, Vercel, or Netlify (SPA rewrites are in `public/_redirects` and `vercel.json`). Keep all data and APIs on Supabase.

## Modules

CRM, projects, inventory, procurement, invoicing, loans, payroll (PAYE / NAPSA / NHIMA), HR, attendance, assets, compliance, accounting, reports.
