# KhanHomes Discover v0.6 — guided house-hunting experience

## Product boundaries

The independent KhanHomes Discover app remains a separate repo and data boundary from KhanHomes operations. v0.6 adds four purposeful, functional consumer tools without silently activating real property listings, messaging, accounts, payments, or reservations.

| Tool | URL | Real function | Intentional boundary |
| --- | --- | --- | --- |
| AURA Match | `/match` | Deterministic weighted preference matching, inspectable location/budget/space/feature factors, local preferences | Not an AI property generator, ownership check, valuation, or availability score |
| Search Watch | `/watch` | Local search library, current-catalog match comparison, explicit baseline and manual recheck | No background work, push, SMS, email or exhaustive inventory guarantees |
| Visit Planner | `/visits` | Local tentative itinerary, overlapping time warnings, .ics export in Africa/Nairobi civil time | Not an agent booking, confirmed tour or transport/ETA calculation |
| Price Context | `/homes/[slug]` | Same-county, same-transaction comparison using >=2 other current catalog rows | Not official market data, fair-value appraisal or verified property fee |

## Implementation and quality

- `lib/match-engine.ts` operates on published/public catalog fields exclusively. The output is preference coverage, scored 0–100. Scores cannot be used to alter access or certify a listing. Reserved homes are excluded from suggested matches, while unknown availability is not represented as confirmed.
- `lib/search-watch.ts` computes local differences only from the current returned catalog. First-time checks create baselines and never mark the entire catalog as new. For large inventories the catalog may be paginated/truncated.
- `lib/calendar-export.ts` creates tentative RFC 5545 entries; the events explicitly say *PERSONAL REMINDER ONLY* and never assert a manager confirmed any time.
- `lib/market-context.ts` avoids comparing under two other samples, reports the comparison sample size, and never displays external valuations.
- Preferences, saved searches, checks, tentative visits and notebook entries use origin-local browser storage. Local storage is neither encrypted cross-device backup nor a shared KhanHomes login.
- CI runs TypeScript, Vitest, lint, Next.js production build, desktop/mobile Playwright, overflow tests at 320–1440px, and screenshot artifacts.
- Theme and atmosphere tokens continue the original KhanHomes AURA visual vocabulary.

## Next production gates

A fully operational marketplace still needs: verified landlord/agent publication UI and durable outbox on KhanHomes, independent Discover Supabase instance and applied migrations, authorized request recipient workflows, authentic photo permissions, cross-account end-to-end/RLS and abuse tests, complete moderation handling, privacy/retention controls, and approved outbound email/push providers. Site-level registration and real request submission remain off until those checks are satisfied.

The existing public Vercel URL can safely host the *clearly labeled preview* during development.
