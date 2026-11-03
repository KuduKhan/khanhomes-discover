# KhanHomes Discover — Existing-Feature Excellence Freeze

Version candidate: **v0.8.1-rc.1** (quality improvements to v0.8.0; not a new feature release).

## Scope

Freeze new modules until existing Discover workflows are coherent, accessible, responsive, predictable and verified:

1. Search, saved homes, sorting, filters and three-property comparison.
2. Saved searches and manually checked Search Watch, without background notification claims.
3. AURA Match preference ranking, score explanations and independent appearance modes.
4. Local-only notebook, checklist, import/export and saved-home continuity.
5. Tentative visit planner, conflict warning, calendar export and clear non-booking status.
6. Listing Atelier drafts: no live publishing or approval.
7. Finance Desk: truthful calculations, bounded assumptions and no lender eligibility claims.
8. Separate seeker accounts and gated requests: never enabled without external backend/email/authorization acceptance.
9. Shared Trinity Header visual consistency, keyboard navigation, theme and mobile/tablet/desktop layouts.

## Implemented in first quality pass

- One validated favorites parser shared by the search page and home notebook; malformed browser data recovers.
- Cross-tab updates to favorites, notebook assessments, saved searches, watch baselines, AURA ranking preferences, visit plans and listing drafts.
- Search query parsing responds to browser history navigation, preserving saved-search deep links.
- Tentative visit planner refuses duplicate same-home/date/time entries and flags overlap in plain language.
- Finance inputs are bounded to their displayed limits, and a missing monthly income is not mislabeled a 0% ratio.
- Scoped responsive/accessible refinements reuse existing AURA theme tokens, with no shared Trinity Header rewrite.
- Browser tests exercise existing workflows and narrow screens; existing security and publication gates remain unchanged.

## Acceptance before v0.8.1 production

- [ ] TypeScript, unit tests, zero-warning lint, production build, browser E2E.
- [ ] Browser negative/no-overflow checks at 320, 375, 768, 1024 and 1440px, including AURA themes.
- [ ] No lost or cross-user browser-local data; cross-tab sync and corrupted storage recovery.
- [ ] Verify saved-search URLs, comparison limit, real listing authorization and publishing boundary.
- [ ] Verify exact main commit, Vercel READY status, live alias and smoke tests before production acceptance.
- [ ] Validate authenticated cross-account/private-request flows independently before enabling seeker accounts, enquiries or verified listing publication.

No private account data, user passwords, property availability, verified claims or payment processing are introduced by this release.
