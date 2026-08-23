# Thinkatic — QA Checklist

Run through this checklist before every release. Test on real devices where possible.

---

## Testing Matrix

| Browser    | Desktop | Tablet (768px) | Mobile (375px) |
|------------|---------|----------------|----------------|
| Chrome     | ✅ Required | ✅ Required | ✅ Required |
| Firefox    | ✅ Required | ⚠️ Spot check  | ⚠️ Spot check  |
| Safari     | ✅ Required | ✅ Required | ✅ Required (iOS) |
| Edge       | ⚠️ Spot check | —          | —              |

---

## 1. Global / All Pages

### Navbar
- [ ] Logo links to `/`
- [ ] All nav links navigate to correct pages
- [ ] "REQUEST PROPOSAL" links to `/request-proposal`
- [ ] "BOOK CONSULTATION" links to `/contact`
- [ ] Mobile hamburger opens/closes full-screen nav
- [ ] Navbar hides on scroll down, reappears on scroll up
- [ ] Navbar becomes opaque when scrolled (not on top)
- [ ] Active route is highlighted in the nav
- [ ] BPO mega menu opens on hover / closes on leave
- [ ] Mobile BPO submenu expands/collapses correctly
- [ ] Keyboard: all nav items reachable by Tab key
- [ ] Screen reader: landmark roles present (nav, main, footer)

### Footer
- [ ] All footer links navigate correctly
- [ ] Social icons link to correct destinations
- [ ] Newsletter form submits and shows success state
- [ ] Contact links (email, phone) have correct `href` values
- [ ] Copyright year is current

### Cookie Banner
- [ ] Appears on first visit (after ~1.2s delay)
- [ ] Does NOT appear if consent already stored in localStorage
- [ ] "Accept All" stores consent and dismisses banner
- [ ] "Decline" dismisses banner, stores minimal consent
- [ ] "Preferences" expands detail toggles
- [ ] "Save Choices" saves custom preferences
- [ ] Re-visiting does not re-show the banner
- [ ] `localStorage.getItem("thinkatic_cookie_consent")` contains correct JSON after each action

### 404 Page
- [ ] Appears for completely unknown routes (e.g. `/xyz-does-not-exist`)
- [ ] "Back to Home" navigates to `/`
- [ ] Quick links navigate correctly
- [ ] Page is NOT indexed (`noIndex: true` in useSEO)

### Error Boundary
- [ ] Throwing a JS error inside a component shows the error fallback
- [ ] "Try Again" button clears the error state
- [ ] "Back to Home" navigates to `/` and resets
- [ ] Error details shown in development, hidden in production

### SEO / Meta
- [ ] Each page has a unique `<title>` tag
- [ ] Each page has a `<meta name="description">` tag
- [ ] Each page has a correct canonical URL
- [ ] OG image is accessible at `https://thinkatic.com/opengraph.jpg`
- [ ] JSON-LD structured data present in `<head>` on each page

---

## 2. Home Page (`/`)

- [ ] Hero section loads above the fold
- [ ] All CTAs are clickable and navigate correctly
- [ ] Animated sections trigger on scroll (not before viewport)
- [ ] Stats/numbers display correctly
- [ ] Testimonials / case study cards render
- [ ] No layout overflow on mobile

---

## 3. Services (`/services`, `/services/:slug`)

- [ ] Services listing page shows all services
- [ ] Clicking a service card navigates to `/services/[slug]`
- [ ] Service detail page renders with correct content
- [ ] "Request Proposal" CTA on service pages links to `/request-proposal`
- [ ] Breadcrumb is present and correct

---

## 4. Contact Page (`/contact`)

**Step 1 — Contact Info:**
- [ ] Form renders correctly on all breakpoints
- [ ] Name: required, min 2 chars — shows error if violated
- [ ] Email: required, valid email format — shows error
- [ ] Company: required — shows error
- [ ] Country: required, CountrySelector opens and filters — shows error
- [ ] Phone: optional, no validation error when empty
- [ ] "Continue" button disabled until Step 1 is valid
- [ ] "Continue" navigates to Step 2

**Step 2 — Project Details:**
- [ ] Department cards — selecting one highlights it, deselects previous
- [ ] Department: required — shows error if none selected
- [ ] Service Interest: required — shows error
- [ ] Budget: optional
- [ ] Message: required, min 10 chars — shows error
- [ ] "← Back" returns to Step 1 with data preserved
- [ ] Submit button shows loading spinner while submitting
- [ ] **Success state** appears after successful submission
- [ ] **Error state** shows error banner if API fails
- [ ] Pre-fill: visiting `/contact?project=Test` fills message field
- [ ] Pre-fill: visiting `/contact?type=proposal` fills correct message
- [ ] Left panel: Google Maps embed loads
- [ ] Left panel: Business info cards display correctly

---

## 5. Request Proposal (`/request-proposal`)

**Step 1:**
- [ ] First/last name, email, company required
- [ ] Country selector works
- [ ] Company size select renders
- [ ] Continues to Step 2

**Step 2:**
- [ ] Service multi-select cards toggle on/off correctly
- [ ] At least 1 service required — shows error if none
- [ ] Team size and budget required
- [ ] DatePicker opens, can select future dates, disables past dates
- [ ] "Clear" (X) on DatePicker removes date
- [ ] Project goal textarea validates min 20 chars
- [ ] File upload: drag & drop works; click to browse works
- [ ] File upload: files > 20MB show error; valid files show in list
- [ ] File upload: "X" on file removes it
- [ ] Continues to Step 3

**Step 3:**
- [ ] Review summary shows correct data from Steps 1 & 2
- [ ] Terms checkbox required — shows error if unchecked
- [ ] Submit shows loading spinner
- [ ] Success state shown after submission
- [ ] "Submit another request" resets form to Step 1
- [ ] Sidebar panel shows step progress on desktop

---

## 6. Careers (`/careers`)

- [ ] Hero section loads correctly
- [ ] Department filter cards render (8 departments)
- [ ] Clicking a department filters the job list
- [ ] "All Departments" shows all jobs
- [ ] Job count badge on each department card is accurate
- [ ] Search bar filters jobs by title, department, or tag
- [ ] Clearing search shows all (department-filtered) jobs
- [ ] "No positions found" empty state shows when no matches
- [ ] Each job card: shows title, department badge, mode badge, location, description, tags
- [ ] "More info" expands requirements; "Less info" collapses
- [ ] "Apply Now" navigates to `/apply-online?position=[id]&department=[dept]`
- [ ] Open application CTA at the bottom works

---

## 7. Apply Online (`/apply-online`)

**Step 1 — Personal Info:**
- [ ] Pre-fills position/department from URL query params
- [ ] First name, last name, email, phone, country, city — all required
- [ ] LinkedIn URL validation (must be valid URL or empty)
- [ ] CV file upload: accepts PDF/Word only; rejects other types
- [ ] CV file upload: max 5MB enforced
- [ ] Continues to Step 2

**Step 2 — Experience:**
- [ ] Position, department, employment type, experience years — required
- [ ] DatePicker for availability — disables past dates
- [ ] Cover letter: required, min 50 chars — shows error
- [ ] Supporting docs: accepts multiple file types; max 10MB each
- [ ] "← Back" returns to Step 1 with data preserved
- [ ] Continues to Step 3

**Step 3 — Final Details:**
- [ ] Application summary shows correct data from Steps 1 & 2
- [ ] Skills field: required, min 5 chars
- [ ] Why Thinkatic: required, min 30 chars
- [ ] "How did you hear" select: optional
- [ ] Terms checkbox: required — shows error
- [ ] Submit shows loading spinner
- [ ] Success state shown after submission
- [ ] "Submit another application" resets form

---

## 8. Other Pages

### About (`/about`)
- [ ] Page loads, no console errors
- [ ] Team section, stats, company story render

### Pricing (`/pricing`)
- [ ] Pricing cards render correctly
- [ ] CTA buttons link correctly

### Case Studies (`/case-studies`)
- [ ] Cards render; links to individual cases work

### FAQ (`/faq`)
- [ ] Accordion opens/closes correctly
- [ ] Search works (if implemented)
- [ ] JSON-LD FAQ structured data present

### Blog (`/blog`)
- [ ] Blog cards render
- [ ] No broken image links

### Technology (`/technology`)
- [ ] 3D sections load (Three.js / R3F)
- [ ] No console errors on load

### Legal Pages (Privacy Policy, Terms, Cookie Policy)
- [ ] Content renders
- [ ] Back/navigation links work

---

## 9. Accessibility (Full Audit)

- [ ] Tab through entire page without mouse — all elements reachable
- [ ] Focus ring visible on all interactive elements
- [ ] No keyboard traps (focus never gets stuck)
- [ ] Skip-to-content link works: Tab → Enter on first tab stop jumps to `#main-content`
- [ ] Screen reader (VoiceOver / NVDA): all form labels read correctly
- [ ] All images have descriptive `alt` text
- [ ] Dynamic content changes announced (AnimatePresence, form errors)
- [ ] ARIA landmark roles present: `<nav>`, `<main id="main-content">`, `<footer>`
- [ ] Modal/dialog (if any): focus trapped inside while open
- [ ] Color contrast passes WCAG AA for all text (use browser DevTools)
- [ ] Cookie banner: keyboard-operable, role="dialog", focus managed

---

## 10. Responsive / Mobile

| Test | 375px | 768px | 1024px | 1440px |
|------|-------|-------|--------|--------|
| Navbar (hamburger on mobile) | | | | |
| Hero text doesn't overflow | | | | |
| Forms are single-column on mobile | | | | |
| Department cards wrap correctly | | | | |
| Footer links readable | | | | |
| Cookie banner fits in viewport | | | | |
| Contact left panel hides on mobile | | | | |
| Google Maps embed fits container | | | | |
| File upload drag zone visible | | | | |
| Step indicator readable | | | | |

---

## 11. Performance Checks

Run in Chrome DevTools → Lighthouse (incognito, No throttling first, then Slow 4G):

| Metric | Target | Actual |
|--------|--------|--------|
| Performance | ≥ 90 | |
| Accessibility | ≥ 85 | |
| Best Practices | ≥ 90 | |
| SEO | ≥ 90 | |
| LCP | < 2.5s | |
| CLS | < 0.1 | |
| FID/INP | < 200ms | |

- [ ] No images without `width`/`height` attributes (causes layout shift)
- [ ] No render-blocking resources
- [ ] Fonts loaded with `display=swap`
- [ ] JS bundle sizes within targets (no single file > 500 KB)
- [ ] Network tab: no 4xx/5xx on page load

---

## 12. API / Backend

- [ ] `GET /api/healthz` returns 200
- [ ] `POST /api/contacts` — accepts and stores contact submissions
- [ ] Form submissions from Contact, Proposal, Apply all POST correctly
- [ ] API returns proper error responses for invalid payloads
- [ ] Rate limiting works (try submitting many times quickly)

---

## Sign-off

| Role | Name | Date | Pass? |
|------|------|------|-------|
| Developer | | | |
| QA Lead | | | |
| Product Owner | | | |
