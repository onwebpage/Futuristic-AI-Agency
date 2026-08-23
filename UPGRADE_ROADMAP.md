# Thinkatic — UI/UX Upgrade Roadmap

> Audit date: August 2026  
> Status: Phase 1 (Design System Foundation) — **COMPLETE**

---

## Audit Summary

### 🔴 Critical Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Duplicate Navbar (layout + sections) | `components/layout/Navbar.tsx` vs `components/sections/Navbar.tsx` | Dead code, maintenance risk |
| 2 | Duplicate Footer (layout + sections) | `components/layout/Footer.tsx` vs `components/sections/Footer.tsx` | sections/Footer uses broken hash links |
| 3 | Duplicate section components | `Industries` + `IndustriesSection`, `CaseStudies` + `CaseStudiesSection` | Conflicting implementations |
| 4 | `AdminDashboardPage` is 1321 lines | `pages/AdminDashboardPage.tsx` | Unmaintainable monolith |
| 5 | SEO meta description is placeholder | `index.html` | Google will reject it |
| 6 | No per-route `<title>` or meta | All pages via Wouter | Every page shows same title in tabs |

### 🟠 High Priority

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 7 | Hardcoded hex colors (`#47A3FF`, `#2563EB`, `rgba(...)`) | 15+ files | Cannot theme or rebrand |
| 8 | No shared card abstraction | All sections | 6+ different card styles, inconsistent UX |
| 9 | Form inputs lack `htmlFor`/`id` pairing | `ContactPage`, `AdminLoginPage` | Screen readers cannot navigate forms |
| 10 | Icon-only buttons without `aria-label` | `AdminDashboardPage`, `AboutPage`, `Showreel` | WCAG 2.1 AA failure |
| 11 | `dangerouslySetInnerHTML` in ChatBot | `components/ui/ChatBot.tsx:397` | XSS vector if any server data flows in |
| 12 | `button` nested inside `Link` in sections Navbar | `sections/Navbar.tsx:365` | Invalid HTML — keyboard nav breaks |
| 13 | `Hero.tsx` is 674 lines | `components/sections/Hero.tsx` | Cannot iterate quickly |

### 🟡 Medium Priority

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 14 | Inline `clamp()` font sizes scattered | `CaseStudiesSection`, `FAQPage`, `FeaturedProjects` | Typography inconsistency |
| 15 | Bespoke buttons + shadcn Button + MagneticButton all coexist | Many sections | Visual inconsistency |
| 16 | `text-[10px]` arbitrary Tailwind usage | `FAQPage`, `sections/` | Below 12px minimum legible size |
| 17 | Decorative SVGs lack `aria-hidden="true"` | Multiple sections | Screen readers read noise |
| 18 | No per-route SEO (react-helmet or equivalent) | `App.tsx` + all pages | SEO and UX gap |
| 19 | Missing `og:image`, `canonical`, Twitter image | `index.html` | Social sharing broken |
| 20 | Inline styles in AdminDashboardPage (~40 occurrences) | `AdminDashboardPage.tsx:112+` | Cannot override with Tailwind |
| 21 | `Inter` font loaded but never used (Satoshi is the brand font) | `index.html` | Wasted 40KB load |

### 🟢 Low Priority / Polish

| # | Issue | Impact |
|---|-------|--------|
| 22 | `text-gradient-blue` duplicates `text-gradient` with different stops | Confusing to maintain |
| 23 | Shadow tokens all near-identical (all `0px 2px 0px`) | Shadows provide no depth |
| 24 | `--radius: 1.5rem` is very large — most cards use override `rounded-2xl` | Token unused |
| 25 | No loading skeleton for API-backed pages (Pricing) | Jarring content flash |

---

## Phases

### ✅ Phase 1 — Design System Foundation (COMPLETE)

Files created:

```
src/
├── design-system/
│   ├── index.ts              ← barrel (Display, H1–H4, Body, Eyebrow…)
│   └── typography.tsx        ← fluid type scale on Satoshi
├── components/
│   ├── ui/
│   │   ├── button.tsx        ← ENHANCED: added cta / glass / gradient / xl
│   │   ├── badge.tsx         ← ENHANCED: added glow / success / warning / info / label / live
│   │   ├── card.tsx          ← ENHANCED: added glass / surface / glow / outline variants
│   │   ├── section.tsx       ← NEW: Section + Container + Grid
│   │   └── section-header.tsx← NEW: Eyebrow + H2 + Body, left/center align
│   └── brand/
│       ├── service-card.tsx  ← NEW
│       ├── industry-card.tsx ← NEW
│       ├── stats-card.tsx    ← NEW (default / compact / hero variants)
│       ├── testimonial-card.tsx ← NEW
│       ├── process-card.tsx  ← NEW (default / timeline variants)
│       ├── cta-banner.tsx    ← NEW (default / gradient / split variants)
│       └── index.ts          ← barrel
index.html                    ← FIXED: real SEO meta, og:image, canonical
src/index.css                 ← EXTENDED: status colors, glow tokens, surface tokens,
                                 shadow-glow, section spacing, container widths
```

**New design tokens added to `index.css`:**
- `--surface-0/1/2/3` — surface hierarchy
- `--glow-primary / --glow-primary-md / --glow-primary-lg` — blue glow
- `--shadow-glow-sm / --shadow-glow / --shadow-glow-lg` — glow box-shadows
- `--success`, `--warning`, `--info` + foreground + border variants
- `--section-y` / `--section-y-sm/lg/xl` — vertical rhythm
- `--container-sm` through `--container-2xl`
- `--radius-card`, `--radius-button`, `--radius-badge`, `--radius-pill`

---

### 🔲 Phase 2 — Remove Duplicate Components

**Goal:** Delete dead code, establish single source of truth.

Tasks:
- [ ] Delete `src/components/sections/Navbar.tsx` (dead)
- [ ] Delete `src/components/sections/Footer.tsx` (dead, broken hash links)
- [ ] Consolidate `Industries.tsx` + `IndustriesSection.tsx` → keep `IndustriesSection`, rename to `Industries`
- [ ] Consolidate `CaseStudies.tsx` + `CaseStudiesSection.tsx` → keep `CaseStudiesSection`
- [ ] Verify `Home.tsx` + all pages only import from `layout/`

---

### 🔲 Phase 3 — Replace Hardcoded Colors

**Goal:** Every color reference uses a CSS variable or Tailwind token.

Files to update (highest density first):
1. `pages/AdminDashboardPage.tsx` (40+ occurrences)
2. `components/sections/CaseStudiesSection.tsx`
3. `components/sections/OurClients.tsx`
4. `components/sections/GoldStandard.tsx`
5. `pages/FAQPage.tsx`
6. `pages/ContactPage.tsx`
7. `components/ui/ChatBot.tsx`

Pattern: `#47A3FF` → `hsl(var(--primary))` / `text-primary`  
Pattern: `#2563EB` → `hsl(var(--primary-500))`  
Pattern: `rgba(255,255,255,0.05)` → `bg-white/5`

---

### 🔲 Phase 4 — Accessibility Pass

**Goal:** WCAG 2.1 AA compliance across all interactive elements.

- [ ] Add `htmlFor`/`id` pairs to all form inputs (`ContactPage`, `AdminLoginPage`)
- [ ] Add `aria-label` to all icon-only buttons (`AdminDashboardPage`, `AboutPage`, `Showreel`)
- [ ] Add `aria-hidden="true"` to all decorative SVGs and icons
- [ ] Fix FAQ accordion to use semantic `<details>`/`<summary>` or ARIA roles
- [ ] Review `ChatBot.tsx` `dangerouslySetInnerHTML` — sanitize or replace
- [ ] Fix invalid `button > Link` nesting in sections/Navbar (before deletion)
- [ ] Minimum font size audit — replace `text-[10px]` with `text-xs` (12px)

---

### 🔲 Phase 5 — Per-Route SEO

**Goal:** Every page has a unique `<title>` and `<meta name="description">`.

- [ ] Install `react-helmet-async` (or use Vite `vite-plugin-html-inject`)
- [ ] Create `SEOHead` component wrapping `<Helmet>`
- [ ] Add `<SEOHead>` to every page component with unique title + description
- [ ] Add `og:url` to each page using `window.location.href` or route constant

---

### 🔲 Phase 6 — Component Refactors

**Goal:** No component over 300 lines; extract shared sub-components.

Priority order:
1. `AdminDashboardPage.tsx` (1321 lines) → extract `AdminStatsGrid`, `AdminTable`, `AdminSidebar`
2. `IndustriesSection.tsx` (704 lines) → extract industry data to `data/industries-data.ts`
3. `Hero.tsx` (674 lines) → extract `HeroStats`, `AIPulseCore` to separate files
4. `AIBPOSection.tsx` (424 lines) → extract service list to data file
5. `ITServicesSection.tsx` (395 lines) → same

---

### 🔲 Phase 7 — Typography Enforcement

**Goal:** All headings/body text uses `design-system/typography` components.

- [ ] Replace raw `<h2 className="font-display font-bold...">` with `<H2>`
- [ ] Replace raw eyebrow spans with `<Eyebrow>`
- [ ] Replace `clamp()` inline sizes with typed scale
- [ ] Remove `text-[10px]` usage site-wide
- [ ] Audit and standardise `leading-*` values

---

### 🔲 Phase 8 — Performance

**Goal:** Core Web Vitals green on mobile.

- [ ] Lazy-load Three.js / `@react-three/fiber` — currently blocking hero render
- [ ] Add `loading="lazy"` to all below-fold images
- [ ] Move Fontshare `@import` to `<link rel="preload">` in HTML
- [ ] Add `<Suspense>` boundaries around each page component in `App.tsx`
- [ ] Add skeleton components for API-backed sections (Pricing plans)
- [ ] Audit bundle — `dist/index.mjs` is 3.4 MB; identify largest imports

---

## Design Token Reference

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `hsl(217 100% 63%)` — electric blue | CTAs, highlights, icons |
| `--secondary` | `hsl(245 88% 65%)` — deep indigo | Gradients, accents |
| `--background` | `hsl(0 0% 2%)` — near black | Page bg |
| `--card` | `hsl(0 0% 7%)` — dark grey | Cards, panels |
| `--muted-foreground` | `hsl(0 0% 45%)` | Body text, descriptions |
| `--success` | `hsl(142 71% 45%)` | Positive status |
| `--warning` | `hsl(38 92% 50%)` | Caution |
| `--info` | `hsl(199 89% 48%)` | Informational |

### Typography Scale

| Component | Size | Weight | Use |
|-----------|------|--------|-----|
| `Display` | clamp(2.75rem → 5rem) | Black | Hero headlines |
| `DisplaySm` | clamp(2rem → 3.75rem) | Black | Sub-hero |
| `H1` | clamp(1.875rem → 3rem) | Bold | Page titles |
| `H2` | clamp(1.5rem → 2.5rem) | Bold | Section headings |
| `H3` | clamp(1.125rem → 1.625rem) | Semibold | Card headings |
| `H4` | clamp(1rem → 1.25rem) | Semibold | Sub-headings |
| `BodyLg` | 1.125rem | Regular | Lead paragraphs |
| `Body` | 1rem | Regular | Body copy |
| `BodySm` | 0.875rem | Regular | Secondary text |
| `Eyebrow` | 0.75rem | Medium | Section labels |

### Card Variants

| Variant | Background | Border | Use |
|---------|-----------|--------|-----|
| `default` | `bg-card` | `border-border` | Standard cards |
| `glass` | `glass-card` (rgba 3%) | `gradient-border` | Section cards |
| `surface` | `surface-2` (rgba 4%) | `white/6` | Nested panels |
| `glow` | `glass-card` | Primary glow on hover | Featured items |
| `outline` | Transparent | `border-border` | Subtle borders |

### Button Variants

| Variant | Use |
|---------|-----|
| `default` | Primary action (blue fill) |
| `cta` | Hero / page-level CTA (gradient pill) |
| `glass` | On dark hero sections |
| `gradient` | Bordered gradient look |
| `outline` | Secondary actions |
| `ghost` | Tertiary / nav items |
| `link` | Inline text links |
