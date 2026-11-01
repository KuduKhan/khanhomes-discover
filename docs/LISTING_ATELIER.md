# KhanHomes Discover v0.7 — Listing Atelier

This is a **standalone, browser-local draft preparation tool**, not a live agency dashboard, a publishing console, a real-estate agency verification process or an authorized manager portal.

## Implemented

- New `/studio` route with private listing draft library (20-item maximum), one-click create/duplicate/delete and browser-local persistence.
- General location, property type, rooms, price, floor area, feature selection, fees/disclosures, a public-facing description and manual preparation checklist.
- Visible *Draft completeness* scoring with explicit details on what has or has not been provided. The score never confers ownership, title or listing verification.
- Styled preview concept card marked **DRAFT ONLY — NOT PUBLIC**. No signed photos or protected private property media is copied into this tool.
- Local JSON export containing `draftOnly:true`, `published:false` and `approved:false`; basic contact-details guard blocks obvious phone/email leakage from free-form public copy.
- No server-side mutation, request to Supabase, new grant, unknown image hosting, payment handling or hidden publication API.
- Responsive styling, keyboard-focus and reduced-motion support.

## Real publisher integration remains gated

1. Within the actual KhanHomes operations workspace, an authenticated admin/manager needs appropriate organization membership and source property/unit authorization.
2. Verify identity/representation rights, property media permissions, current genuine availability, exact quoted terms and occupied-home privacy.
3. Record an auditable publication consent/approval and durable outbox event with monotonically increasing source revision.
4. Transform an accepted, reviewed source unit into a minimal public listing, with approved public photo URLs and appropriate content-moderation decisions.
5. Use the existing signed KhanHomes → Discover HMAC publication endpoint, with retries/deduplication, withdrawal reconciliation and security tests.
6. Implement a linked manager inbox, viewing slot coordination, applicant pipeline, resident handover and their independent staging cross-account tests.
7. Enable verified public listings and authenticated workflows only after operational, security, privacy and consent gates pass.

**A local Atelier export cannot be posted to the signed publication endpoint**. It contains neither verified source UUIDs nor signed approval and is rejected by the strict publication schema. No browser-local checkbox upgrades the owner's authorization.

## Privacy note

Local drafts are unencrypted on the device. Do not save personal details, private unit addresses, access codes, ID photographs, identity documents or bank details. This release explicitly disallows automatic upload and cannot synchronize drafts across accounts or devices.
