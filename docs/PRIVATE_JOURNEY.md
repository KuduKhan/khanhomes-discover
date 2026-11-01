# KhanHomes Discover v0.3 — Private seeker workflows

## Separation of duties

- **Discover** is a separate repository, website, database and Supabase Auth project. It does not grant a KhanHomes operations session, unit access, ownership access or staff permission.
- **KhanHomes** remains the authority for property inventory, units, leases, operations and manager approvals.
- Discover only mirrors explicitly approved and minimal listing snapshots through the existing server-signed publisher bridge. No private media, occupied-home addresses, resident identities, ledger entries or unit access codes.
- A seeker may search anonymously. Sign-up and private submissions remain **disabled** by default.

## Implemented in source

- Independent email/password account UI, with confirmation required and no password storage in KhanHomes.
- Server-side verified Bearer token via Supabase Auth `getUser(token)`, never trust browser preference data or user metadata claims.
- A protected form for a real, recently verified, published and available listing to **request** a viewing or enquire. A request is never a confirmed appointment.
- A private, transactional submission RPC validates verified identity, source freshness, consent, acceptable time window (4 hours–30 days), four requests per rolling day and duplicate active requests.
- An authenticated seeker can read their own request records and cancel pending/reviewing requests.
- Signed-in users can flag misleading, suspicious, duplicate or privacy-invasive listings. Private reports are held for manual moderation, with daily limits.
- A public pre-application checklist explains safe next steps. Document collection, screening, underwriting, identity verification and lease signing remain **not implemented**; no public UI accepts ID documents.
- All private tables use RLS, with private API writes restricted to server-only service-role RPCs. Anon/authenticated cannot insert or update directly.

## Deployment configuration

1. Create a dedicated Supabase project named KhanHomes Discover, physically separate from the existing KhanHomes operations project.
2. Apply the existing publishing migration and **then** `supabase/migrations/20261101043000_private_seeker_journey.sql` to Discover only.
3. Verify the RLS and RPC function grants using authenticated and anonymous test roles; run Supabase Security Advisors and inspect security-definer execution scope.
4. Set server-only variables: `DISCOVERY_SUPABASE_URL`, `DISCOVERY_SUPABASE_SERVICE_ROLE_KEY`, and the signing secret/media host allowlist for publishing. Never expose these in `NEXT_PUBLIC_*`.
5. Set `NEXT_PUBLIC_DISCOVER_SUPABASE_URL` and `NEXT_PUBLIC_DISCOVER_SUPABASE_PUBLISHABLE_KEY` to this same **new Discover** project (public values only).
6. Configure and verify custom SMTP, confirmation URL allowlists, password-reset routes, CAPTCHA/abuse mitigation, and disposable test identity procedures before enabling sign-up. Set `NEXT_PUBLIC_DISCOVER_ACCOUNTS_ENABLED=true` only after these checks.
7. Build an authorized **manager request inbox** within KhanHomes with a separate, signed and scoped delivery/acknowledgement contract. Request records currently stay in Discover; there is no operational recipient action yet.
8. Validate two distinct verified seekers, two separate publisher organizations, cross-account read isolation, listing withdrawal races, request cancellation, replay, concurrency/rate-limit behavior, consent/erasure, and authorized moderation handling.
9. Only after a verified manager inbox is functioning should `DISCOVER_ENABLE_PRIVATE_REQUESTS=true` (server) and `NEXT_PUBLIC_DISCOVER_REQUESTS_ENABLED=true` (UI) be set. Enable both flags deliberately and independently.

**Never** enable the private flags simply because CI passed or Vercel shows READY. No live customer onboarding without the independent gates.

## Test and security constraints

- The code intentionally does not create a reusable account shared with KhanHomes; cross-app SSO is a separate identity/security design.
- No M-Pesa payment requests, booking fees, security deposits, private application documents, or ownership data.
- Authorization decisions are made on the server after a current Auth verification and by database functions. Supabase RLS protects each seeker's own request history and reports are entirely private.
- Report/booking data retention and subject erasure require separately approved policies, a scheduled retention job, disaster-recovery tests, and independent privacy review.
- Automated network calls, mail and real saved-search alert delivery are intentionally disabled. A verified subscription workflow and provider approval are required.

## Next milestone — manager coordination and genuine inventory

- Manager Listing Studio in the **existing KhanHomes workspace**: verified staff, source records, owner consent, media clearance, explicit approval, revisioned outbox, published/withdrawn status and audit.
- Reverse signed event ingestion: an assigned manager may view and respond to requests for their organization only.
- Confirmed appointment workflow: manager replies, recipient-scoped notifications, rescheduling, cancellation, no open-visit conflicts, timezone-correct confirmations.
- Application pipeline: secure verified-user identity, purpose-limited document upload, data retention, review roles, and authorized lease creation.
- Map provider: licensed geocoding/tiles with conservative public area coordinates and meaningful attribution. The current area atlas is explicitly **schematic**, never an exact address.
- Genuine saved-search alerts with opt-in consent, unsubscribe, deduplication and provider rate limits.
