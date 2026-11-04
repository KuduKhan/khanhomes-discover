# KhanHomes Trinity — Premium Responsive Finish v2.2

## Purpose
Refine existing KhanHomes, Discover and Build pages. Do not add modules, navigation links,
records, analytics, roles or permissions. Preserve their own business domains.

## One shared finishing layer
`app/trinity-responsive-finish.css` is identical across the three repositories and
loaded last after the established product styles. It does not replace the original
Trinity Header, atmosphere tokens or application data architecture.

### Refinements
- Header: emblem and slogan remain intact on small phones; menu, product switcher
  and appearance controls keep accessible focus and bounded popovers.
- KhanHomes: legible dashboard KPI cards, adaptive analytics, contained table scrolling,
  centered dialogs, compact topbar, and private-workspace layout.
- Discover: bounded listing cards, search inputs, adaptable property grid, comparison
  table scrolling, and single-column filters and forms on phones.
- Build: consistent sidebar/topbar/content width, adaptive project/budget cards,
  readable forms and metric tiles, and a tablet/mobile drawer.
- KhanHomes demo sidebar: mobile scroll lock, Escape, focus containment and return.

### Responsive acceptance
320, 375, 428, 768, 1024 and 1440px are checked on existing pages. Wide tables
scroll inside their panels rather than stretching the document. Reduced-motion and
reduced-transparency preferences remain respected.

### Release gates
1. TypeScript, Vitest, strict lint and Next.js production build must pass.
2. Desktop and mobile Playwright suites, including the viewport/interaction tests,
   must pass.
3. Merge each product only after CI passes; release only its final main commit
   into its **existing** Vercel production project.
4. Verify READY, correct SHA, production target and alias. Do not claim live
   browser UX is verified merely from the Vercel READY state.
5. Keep KhanHomes Build commercial features gated (`KHANHOMES_BUILD_V05_ENABLED=false`);
   do not modify auth/RLS, database schemas or billing.
