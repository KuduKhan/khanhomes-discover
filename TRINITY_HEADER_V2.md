# KhanHomes Trinity Header v2.0 — Shared Design Contract

This file, components/trinity-header.tsx and app/trinity-header.css are intentionally identical in the three independent repositories. Any update to the shared source must be applied and tested in all three.

## Architecture
- One sticky 72px desktop / 62px mobile public header (no persistent second-row product strip).
- Three zones: fixed emerald KH emblem/wordmark, integrated product selector + per-app navigation, Appearance Studio + one CTA.
- Product selection opens a disclosure with the three distinct origins; never pass cookies, bearer tokens, query session parameters or authentication state across origins.
- Local application links are grouped into primary navigation and a compact More disclosure; mobile uses one app-specific navigation drawer.
- The Workspace apps retain their existing authenticated permission-aware navigation and server-side authorization boundaries. This is a public navigation contract, not a replacement for secure workspace routing.

## Appearance
- Aurora, Daybreak, Midnight, and Light/Dark/System.
- Discover preserves kh-discovery-style, data-atmosphere and data-theme.
- Management and Build preserve kh-family-appearance-v1, data-family-atmosphere and data-family-theme.
- Preferences are visual only, persisted per origin, and never change the approved SVG emerald KH emblem.
- Root layouts load preferences before hydration and resolve System to the platform preference.

## Accessibility and responsive contract
- Product and Appearance disclosures have native buttons, aria-expanded and aria-controls; Escape dismisses and restores focus. Outside clicks dismiss.
- Touch areas >=40px where space permits; focus-visible outlines; reduced-motion support.
- One navigation landmark per purpose, with distinct names for local primary, product switcher and mobile navigation.
- Responsive checks at 320, 390, 768, 1024 and 1440px; no horizontal overflow or header overlap.
- Separate public and secure browser smoke tests; no authorization assumptions from menu visibility.
