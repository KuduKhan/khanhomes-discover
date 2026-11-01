# Secure KhanHomes ↔ Discovery integration contract

## Isolation model

KhanHomes and Discovery have **different repositories, Vercel projects and databases**. Do not share a Supabase service-role key, user session cookie, RLS bypass, private media bucket or raw lease data. Discovery only holds a reviewable, minimal mirror of **approved, intentionally public** listings. A private property record is **never** a listing by default.

Discovery mirrors the same architectural emblem and AURA tokens, but browser localStorage is origin-bound; atmosphere preference never means a shared login or authorization.

## Production prerequisites

1. Create a separate Supabase project for Discovery and run `supabase/migrations/20261101000000_discovery_publication.sql` there only.
2. Configure Discovery server-only `DISCOVERY_SUPABASE_URL` and `DISCOVERY_SUPABASE_SERVICE_ROLE_KEY`. Ensure no `NEXT_PUBLIC_` service secrets.
3. Configure `KHANHOMES_DISCOVERY_WEBHOOK_SECRET` (random at least 32 characters) in both server environments. Never expose it client-side.
4. Configure `DISCOVERY_ALLOWED_MEDIA_HOSTS` with exact public, approved image-host domains only. Private signed object URLs and resident photos are forbidden.
5. Implement a KhanHomes **authorized publishing UI/outbox** that requires an authenticated org admin/manager approval, records explicit publication consent, and emits a minimal public listing snapshot; publish only after independently verified ownership/representation and availability controls.
6. Independent staging tests: forged/old signatures, replay, stale revisions, publishing/withdrawal races, cross-org publication denial, malicious media hosts, consent and photo revocation, and unavailability/withdrawal propagation.
7. Only then enable real publication and authenticated viewing requests. A deployed Preview mode is **not** a functioning real marketplace.

## Wire protocol

POST `https://<discovery-host>/api/integrations/khanhomes`

Headers:
- `Content-Type: application/json`
- `x-kh-timestamp`: current Unix epoch timestamp in seconds
- `x-kh-event-id`: UUID v4, unique per intended event
- `x-kh-signature`: `sha256=<lowercase hex HMAC-SHA256>`

Compute HMAC over the **exact raw UTF-8 body**:

```text
timestamp + "." + eventId + "." + rawJsonBody
```

Maximum age/skew: 300 seconds. Maximum request size: 32,000 bytes. A repeated event ID returns `duplicate`; older revisions return `stale`. The database RPC executes deduplication and upsert in one transaction.

Example source publisher code (runs in KhanHomes backend only):

```ts
import { createHmac,randomUUID } from "node:crypto";
const eventId=randomUUID();
const timestamp=String(Math.floor(Date.now()/1000));
const raw=JSON.stringify(publication);
const signature=createHmac("sha256",secret)
  .update(timestamp+"."+eventId+"."+raw).digest("hex");
await fetch(discoveryWebhookUrl,{
 method:"POST",headers:{
  "Content-Type":"application/json",
  "x-kh-timestamp":timestamp,"x-kh-event-id":eventId,
  "x-kh-signature":"sha256="+signature
 },body:raw
});
```

Payload structure (all fields mandatory unless marked optional):

```json
{
 "version":1,
 "event":"listing.published",
 "listing":{
   "sourceOrgId":"11111111-1111-4111-8111-111111111111",
   "sourcePropertyId":"22222222-2222-4222-8222-222222222222",
   "sourceUnitId":"33333333-3333-4333-8333-333333333333",
   "sourceUpdatedAt":"2026-11-01T10:00:00+03:00",
   "publicationApproved":true,
   "slug":"example-approved-apartment",
   "title":"Example apartment",
   "area":"Kilimani",
   "county":"Nairobi",
   "kind":"Apartment",
   "type":"rent",
   "priceKes":45000,
   "beds":2,"baths":1,"sizeSqm":75,
   "furnished":false,"parking":true,
   "amenities":["Parking","Security"],
   "description":"Public approved listing description with no personal information.",
   "images":["https://approved-cdn.example.com/listings/photo.webp"],
   "availability":"unknown",
   "verification":"listing-reviewed"
 }
}
```

For `verification:"availability-confirmed"`, include `availabilityConfirmedAt` within seven days of `sourceUpdatedAt`. That is a **source-reported** status and cannot substitute for actual independent verification.

Withdraw with `"event":"listing.withdrawn"` and a later `sourceUpdatedAt`. Publisher must re-sign each event and retry using the **same event ID** for idempotent retries. For concurrent events, authoritative source revisions must be monotonically increasing, including withdrawals. In-production expiry/recency checks and periodic reconcile jobs remain required.

## Never mirror

Tenant/resident names, personal emails/phones, bank details, lease documents, payment records, organization membership, private photos, property access codes, exact home address when occupied, IDs, applications, or other private records.

## Release status

The standalone app can ship with fictional public sample homes. Live publishing stays **off** until separate Supabase and publisher authorization are configured and tested. Public search does not imply the presence of any real home.

## v0.3 Private seeker requests (off by default)

KhanHomes Discover uses **its own Supabase Auth instance** and a separate private seeker database. The private workflow requires the v0.3 RLS migration and deliberate enablement of all feature flags after signed-in validation.

- Discovery Auth users cannot read KhanHomes operational organization membership, tenant leases, bank transactions or private documents.
- A viewing request is an **unconfirmed request**. Only authorized property representatives may accept, reject or confirm it in a separately authenticated coordination workspace (not implemented).
- Server-side Bearer tokens are checked by Supabase Auth `getUser(token)`; email confirmation is mandatory. Untrusted user metadata never grants operator privileges.
- Requests are admitted by service-role-only transactional RPCs with listing freshness/availability checks, per-user quotas and a private RLS table.
- Listings reports are never publicly readable and require a verified seeker.
- Until operations work queues, authorization, email verification, privacy retention and tested production infrastructure exist, keep private flags false.
