# KhanHomes Discover

**Independent house-hunting experience, connected to KhanHomes.**

KhanHomes Discover runs in its own repository, deployment and data boundary. It shares the architectural brand emblem, AURA styling, responsive spacing and Daybreak / Aurora / Midnight atmosphere vocabulary with [KhanHomes](https://khanhomes.vercel.app).

## Build milestone: v0.4 browser-local home-hunt planning

A private, browser-local planning workspace is available at `/planner` with saved favorite homes, custom notes, a 10-item viewing checklist, personal ratings, optional local visit dates, JSON export and print styling. These are subjective planning aids—not real appointments, certified inspections or financial applications. All notes stay on the current device; do not enter IDs, passwords or sensitive access details.

## Build milestone: v0.3 private seeker foundations

This release adds **source-gated** separate Discover account, enquiry/viewing-request, cancellation and private fraud-report flows. No authenticated customer requests will be enabled until an independent Supabase project, email-verification/SMTP, appropriate moderation operations and cross-account acceptance are ready. A preview UI is **not** a live booking system. Study `docs/PRIVATE_JOURNEY.md`.

## MVP capabilities

- Responsive editorial landing page and live search/filter/sort interface.
- Clearly labeled **fictional preview listings** until a publishing integration is configured. These are not real properties, prices or availability claims.
- Detail pages, saved properties and a three-home comparison tray.
- Independent appearance settings, keyboard access and reduced-motion support.
- Separate server-side read model for approved public listings. Fail closed when a configured live catalog cannot be read.
- Signed, timestamped, idempotent server-to-server ingestion contract for KhanHomes. No direct access to resident, lease, private document or payment tables.
- A separate Supabase migration and explicit publish/withdraw controls.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without env configuration the catalog is deliberately in **Preview mode**.

To enable verified, published listings, follow `docs/INTEGRATION.md`, create an **independent** Discovery Supabase project, apply the included migration, and configure server-only secrets. Never put service-role keys or webhook secrets into `NEXT_PUBLIC_*`.

## Scripts

`npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`.

## Release policy

An illustrative site is not an operational property marketplace. Listing moderation, identity verification, recent availability checks, real viewing bookings, protected applications, abuse prevention, authentic integration credentials and signed-in staging acceptance must pass before accepting actual users or exposing real listings.
