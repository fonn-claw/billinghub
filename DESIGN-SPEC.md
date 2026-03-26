# BillingHub — Design Specification

## 1. Brand Identity

### App Name Treatment
- **Display**: "BillingHub" — one word, capital B and H
- **Weight**: Heading font (DM Serif Display), 700 weight
- **Pairing**: Logo icon appears to the left of the wordmark, separated by 8px
- **Small contexts** (sidebar, tab title): Icon only or "BillingHub" in body font at 600 weight

### Tagline
**"Marina billing, unified."**
Appears on the login screen below the wordmark in Inter 400, 16px, color `#6B7A8D`.

### Logo Concept
An invoice document sitting atop ocean waves — a receipt/billing sheet (dark navy rectangle with gold header line and white detail lines) positioned above two curved wave strokes (teal over navy). Communicates: billing + maritime. Simple enough for favicon use.

- **File**: `public/assets/logo.svg` (48x48 viewBox)
- **Favicon**: `public/assets/favicon.svg` (32x32 simplified version)

### Visual Metaphor
**"Harbor Ledger"** — Nautical chart precision meets financial authority. The design evokes the organized calm of a well-managed harbor at golden hour: structured dock lines, clear water channels, warm evening light. Every element suggests both maritime expertise and financial control.

---

## 2. Color System

### Primary Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Deep Navy | `#0C2D48` | Sidebar, headings, primary text, logo |
| Secondary | Ocean Teal | `#1B6B93` | Links, active states, secondary buttons, chart accents |
| Accent | Harbor Gold | `#E8AA42` | CTAs, highlights, revenue numbers, premium indicators |

### Semantic Colors

| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#1B9C6B` | Paid status, positive trends, confirmations |
| Warning | `#D4922A` | Overdue 30-day, approaching due dates |
| Danger | `#DC3545` | Overdue 60-90+, errors, failed payments |
| Info | `#1B6B93` | Informational badges, tooltips (same as secondary) |

### Surface Colors — Light Mode

| Surface | Hex | Usage |
|---------|-----|-------|
| Background | `#F6F8FB` | Page background |
| Card | `#FFFFFF` | Cards, modals, dropdowns |
| Sidebar | `#0C2D48` | Main navigation sidebar |
| Sidebar Hover | `#0F3A5C` | Sidebar item hover state |
| Elevated | `#FFFFFF` | Popovers, floating elements (with shadow) |
| Muted | `#EEF1F6` | Table header backgrounds, section dividers |
| Border | `#D8DFE8` | Card borders, input borders, dividers |

### Surface Colors — Dark Mode

| Surface | Hex | Usage |
|---------|-----|-------|
| Background | `#0A1628` | Page background |
| Card | `#111D2E` | Cards, modals |
| Sidebar | `#070F1A` | Main navigation sidebar |
| Sidebar Hover | `#0D1A2D` | Sidebar item hover |
| Elevated | `#152238` | Popovers, floating elements |
| Muted | `#0E1824` | Table headers, dividers |
| Border | `#1C2E42` | Borders, dividers |
| Text Primary | `#E8ECF2` | Primary text in dark mode |
| Text Secondary | `#8896A8` | Secondary/muted text in dark mode |

### Signature Gradient
```css
background: linear-gradient(135deg, #0C2D48 0%, #1B6B93 60%, #E8AA42 100%);
```
Used on:
- Dashboard welcome header (as overlay on `dashboard-header.png`)
- Login hero section background accent
- Primary CTA buttons (subtle version: `linear-gradient(135deg, #1B6B93 0%, #0C2D48 100%)`)

### Industry Reasoning
- **Deep Navy**: Maritime tradition, financial trust — the color of deep water and banker suits. Communicates authority.
- **Ocean Teal**: Modern, energetic — distinguishes from generic "corporate blue." Says "we're tech-forward, not legacy."
- **Harbor Gold**: The warm glow of sunset on water, also the color of currency. Premium but approachable. Draws the eye to revenue numbers and CTAs.

---

## 3. Typography

### Heading Font
**DM Serif Display** — Google Font
- Weights: 400 (regular)
- Character: Editorial, sophisticated, carries financial authority without being cold. The serif adds gravitas that sans-serif billing apps lack.

### Body Font
**Inter** — Google Font
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Character: Clean, highly readable at all sizes, excellent for data-dense billing tables.

### Type Scale

| Level | Size | Weight | Font | Line Height | Letter Spacing |
|-------|------|--------|------|-------------|----------------|
| h1 | 32px | 400 | DM Serif Display | 1.2 | -0.02em |
| h2 | 24px | 400 | DM Serif Display | 1.3 | -0.01em |
| h3 | 20px | 600 | Inter | 1.4 | 0 |
| h4 | 16px | 600 | Inter | 1.4 | 0 |
| body | 14px | 400 | Inter | 1.5 | 0 |
| body-sm | 13px | 400 | Inter | 1.5 | 0 |
| small | 12px | 500 | Inter | 1.4 | 0.01em |
| caption | 11px | 500 | Inter | 1.3 | 0.02em |

### Display Treatment (Hero Numbers)
Large revenue figures on the dashboard use:
- Font: Inter
- Size: 36px
- Weight: 700
- Color: `#0C2D48` (light) / `#E8ECF2` (dark)
- Letter-spacing: `-0.03em`
- The dollar sign is 24px, weight 500, color `#6B7A8D` — visually subordinate to the number

Positive trends: `#1B9C6B` with a `+` prefix
Negative trends: `#DC3545` with a `-` prefix
Trend percentage: 13px, 500 weight, displayed next to the number

---

## 4. Component Style Guide

### Cards
- Border radius: `12px`
- Shadow (light): `0 1px 3px rgba(12, 45, 72, 0.06), 0 1px 2px rgba(12, 45, 72, 0.04)`
- Shadow (dark): `0 1px 3px rgba(0, 0, 0, 0.3)`
- Border: `1px solid #D8DFE8` (light) / `1px solid #1C2E42` (dark)
- Background: `#FFFFFF` (light) / `#111D2E` (dark)
- Padding: `24px`
- Hover (interactive cards): translate Y `-2px`, shadow increases to `0 4px 12px rgba(12, 45, 72, 0.10)`

### Buttons

**Primary**
- Background: `linear-gradient(135deg, #1B6B93 0%, #0C2D48 100%)`
- Text: `#FFFFFF`, Inter 500, 14px
- Border radius: `8px`
- Padding: `10px 20px`
- Hover: brightness increases 10%, shadow `0 2px 8px rgba(27, 107, 147, 0.3)`
- Active: brightness decreases 5%, translateY `1px`

**Secondary**
- Background: `transparent`
- Border: `1px solid #D8DFE8` (light) / `1px solid #1C2E42` (dark)
- Text: `#0C2D48` (light) / `#E8ECF2` (dark)
- Hover: background `#F6F8FB` (light) / `#152238` (dark)

**Ghost**
- Background: `transparent`
- Text: `#1B6B93`
- Hover: background `rgba(27, 107, 147, 0.08)`

**Accent/CTA**
- Background: `#E8AA42`
- Text: `#0C2D48`
- Hover: `#D4922A`
- Used sparingly: "Create Invoice," "Record Payment," "Pay Now"

### Inputs
- Border: `1px solid #D8DFE8` (light) / `1px solid #1C2E42` (dark)
- Border radius: `8px`
- Background: `#FFFFFF` (light) / `#0E1824` (dark)
- Focus ring: `0 0 0 3px rgba(27, 107, 147, 0.15)`, border becomes `#1B6B93`
- Padding: `10px 12px`
- Placeholder: `#A0AABB`

### Tables
- Header: Background `#EEF1F6` (light) / `#0E1824` (dark), Inter 600, 12px uppercase, letter-spacing `0.04em`, color `#6B7A8D`
- Row hover: `#F6F8FB` (light) / `#152238` (dark)
- No alternating row colors — rely on subtle hover and border
- Row border: `1px solid #EEF1F6` (light) / `1px solid #1C2E42` (dark)
- Cell padding: `12px 16px`
- Clickable rows: cursor pointer, hover transition 150ms

### Badges / Status Pills

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Paid | `#E7F5EE` | `#1B9C6B` | none |
| Pending | `#E8F4FA` | `#1B6B93` | none |
| Overdue (30d) | `#FFF3E0` | `#D4922A` | none |
| Overdue (60d+) | `#FDEAEA` | `#DC3545` | none |
| Draft | `#EEF1F6` | `#6B7A8D` | none |
| In Collections | `#FDEAEA` | `#DC3545` | `1px solid #DC3545` |
| Partial Payment | `#E7F5EE` | `#1B9C6B` | `1px dashed #1B9C6B` |

Dark mode: backgrounds become 12% opacity versions of the text color.

- Border radius: `6px`
- Padding: `2px 10px`
- Font: Inter 500, 12px

### Sidebar
- Background: `#0C2D48` (light) / `#070F1A` (dark)
- Width: `260px` (expanded), `72px` (collapsed)
- Logo: displayed at top with `24px` padding
- Nav items: Inter 500, 14px, `#A8C4D8` (inactive), `#FFFFFF` (active)
- Active item: Background `rgba(27, 107, 147, 0.25)`, left border `3px solid #E8AA42`, border-radius `0 8px 8px 0`
- Hover: background `#0F3A5C`
- Icons: Outline style, 20px, stroke-width 1.5 — use Lucide icons
- Divider between nav groups: `1px solid rgba(168, 196, 216, 0.15)`
- Bottom section: user avatar (32px circle), name, role badge

### Navigation
- **Layout**: Sidebar navigation (primary), no top navigation bar
- **Breadcrumbs**: Inter 400, 13px, `#6B7A8D`, separator `/`, current page in `#0C2D48` 500 weight
- **Page header**: h1 in DM Serif Display, positioned at top of content area with `32px` bottom margin

---

## 5. Layout & Spacing

### Grid System
- Max content width: `1400px` (centered on ultra-wide screens)
- Sidebar width: `260px`
- Content area padding: `32px`
- Section gap: `24px`

### Card Layouts
- Dashboard stat cards: 4-column grid, `16px` gap
- Chart cards: 2-column grid (60/40 or 50/50 splits), `16px` gap
- Below `1200px`: stat cards become 2-column
- Below `768px`: everything stacks to single column

### Density
**Comfortable** — Marina operators are often older, working on varied screen sizes (office desktop, dock tablet). Generous padding ensures readability without wasting space. Data tables are the densest element; everything else breathes.

### Responsive Breakpoints
- `1400px+`: Full layout with expanded sidebar
- `1200px`: Stat cards → 2 columns, charts → stacked
- `768px`: Sidebar collapses to icon-only (72px), content fills screen
- `640px`: Mobile — sidebar becomes bottom sheet/overlay, single column layout

---

## 6. Motion & Interaction

### Page Transitions
- Route changes: content area fades in with subtle slide-up (200ms, `ease-out`)
- `opacity: 0 → 1`, `translateY: 8px → 0`

### Micro-interactions
- **Card hover**: `translateY: -2px`, shadow deepens (200ms, `ease-out`)
- **Button press**: `translateY: 1px`, slight darken (100ms)
- **Sidebar item**: background slides in from left (150ms)
- **Table row hover**: background color transition (100ms)
- **Badge appear**: scale from `0.9 → 1` with opacity fade (150ms)

### Data Animations
- **Revenue numbers**: Counter roll-up from 0 on initial load (800ms, `ease-out`)
- **Charts**: Draw-in animation, bars grow from bottom, lines trace left-to-right (600ms, `ease-out`, 100ms stagger between elements)
- **Aging bars**: Grow from left to right (400ms, `ease-out`)
- **Percentage changes**: Fade in after number reaches final value (200ms delay)

### Skeleton Loading
- Pulse animation: opacity oscillates between `0.4` and `1.0` (1.5s cycle)
- Skeleton color: `#EEF1F6` (light) / `#1C2E42` (dark)
- Skeleton shapes mirror the exact layout of the content they replace
- Border radius matches content (`12px` for cards, `8px` for inputs)

---

## 7. Key Screens — Visual Direction

### Login / Landing
- **Layout**: Split screen — left 55% content, right 45% hero image
- **Left side**: Clean white/`#F6F8FB` background. Logo + wordmark centered vertically. Tagline below. Login form centered with generous whitespace. Demo credentials displayed in a subtle card below the form.
- **Right side**: `hero-marina.png` fills the panel, edge-to-edge. A subtle gradient overlay from left (`#F6F8FB` at 100% opacity) fades into the image over 60px, creating a seamless blend.
- **Wave pattern**: `wave-pattern.svg` positioned at the bottom of the left panel, very subtle (5-8% opacity)
- **Mood**: Calm, authoritative, inviting. Like opening the door to a well-organized harbor office at sunset.

### Dashboard (Revenue Dashboard — HERO FEATURE)
- **Header**: Full-width card with `dashboard-header.png` as background (cropped to ~200px height), overlaid with semi-transparent gradient (`rgba(12, 45, 72, 0.85)`). Welcome message ("Good evening, Harbor Master") in DM Serif Display, white. Today's date and marina name below in Inter 400, `#A8C4D8`.
- **Stat cards row**: 4 cards — Total Revenue (YTD), Outstanding Balance, Collection Rate, Cash Flow Forecast. Each shows a large number in Inter 700 36px, a trend indicator, and a sparkline.
- **Revenue number**: Harbor Gold `#E8AA42` for the primary revenue figure. Other stats in `#0C2D48`.
- **Charts section**: Two-column layout. Left: Accounts Receivable Aging (horizontal stacked bar chart — green/gold/orange/red). Right: Revenue by Category (donut chart with legend).
- **Below**: Collection rate trend (area chart, teal fill with navy line). Activity feed / recent invoices table.
- **Chart colors**: Use palette in order: `#1B6B93`, `#E8AA42`, `#0C2D48`, `#1B9C6B`, `#DC3545`, `#6B7A8D`

### Invoice Creation (Primary Workflow)
- **Feel**: Tool-like but not overwhelming. Clean form with clear sections.
- **Customer selector**: Search input with dropdown, shows customer name + slip number + current balance
- **Line items**: Table-like rows that can be added/removed. Each row: category dropdown, description, quantity, rate, amount (auto-calculated). Subtle alternating tint on rows.
- **Invoice total section**: Right-aligned, card-within-card with `#F6F8FB` background. Subtotal, tax, total — with total in Inter 700, 24px.
- **Actions**: "Save as Draft" (secondary button), "Send Invoice" (accent button with Harbor Gold)

### List / Table Views (Invoices, Payments, Customers)
- **Filter bar**: Horizontal row of filter chips/dropdowns. Status filters as pill buttons (toggle-able). Search input on the right.
- **Table**: Clean, well-spaced. Status badge in the first or second column. Amounts right-aligned, monospace-style (`font-variant-numeric: tabular-nums`).
- **Hover row**: Subtle background tint. Entire row is clickable to navigate to detail.
- **Pagination**: Bottom-right, simple "Previous / Next" with page count.

### Detail Views (Invoice Detail, Customer Profile)
- **Layout**: Tabbed interface within a single page
- **Header card**: Full-width, shows key info (invoice number, status badge, customer, total amount). Actions (Edit, Download PDF, Send, Record Payment) as buttons in the header.
- **Tabs**: "Details", "Payments", "Activity" — underline-style tabs, active tab uses `#1B6B93` underline (3px) with text in `#0C2D48`.
- **Content sections**: Card-based, with clear section headers in Inter 600.

### Customer Portal
- **Simplified navigation**: No sidebar — top bar with logo, account name, logout
- **Landing**: Account summary card (balance, next due date, last payment). Below: invoice list filtered to their account.
- **Mood**: Consumer-friendly, less dense than the admin view. Slightly larger text (body at 15px). "Pay Now" button prominent in Harbor Gold (disabled with "Coming Soon" tooltip for demo).

### Empty States
- **Illustration**: Centered SVG from `public/assets/empty-*.svg`
- **Heading**: DM Serif Display, 20px, `#0C2D48`
- **Body**: Inter 400, 14px, `#6B7A8D`, max-width `360px`, centered
- **CTA**: Primary button below
- **Messaging tone**: Encouraging, not apologetic. "Create your first invoice" not "No invoices found."

---

## 8. Signature Element

### Nautical Chart Wave Contours
The signature visual element is a **wave contour pattern** inspired by nautical depth charts (bathymetric lines). These subtle, flowing lines appear as background decoration throughout the app:

- **Pattern file**: `public/assets/wave-pattern.svg`
- **Usage**:
  - Login screen left panel: bottom section, 5-8% opacity
  - Dashboard header: underlying texture beneath the gradient overlay
  - PDF invoices: subtle footer decoration
  - Empty states: behind the illustration at 3-5% opacity
  - 404 / error pages: larger, more prominent (15-20% opacity)

- **Style**: Smooth sine-wave curves at varying intervals, using `#1B6B93` and `#0C2D48` strokes at very low opacity. Creates depth without clutter. Evokes depth soundings on a harbor chart.

- **What makes it distinctive**: Most SaaS billing apps are visually sterile — plain white cards on gray backgrounds. The wave contours give BillingHub an unmistakable identity. A screenshot of this app is instantly recognizable as "marina billing" without reading a word.

---

## 9. Dark Mode

### Color Mapping
All dark mode surface colors are defined in Section 2. Additional mappings:

| Element | Light | Dark |
|---------|-------|------|
| Primary text | `#0C2D48` | `#E8ECF2` |
| Secondary text | `#6B7A8D` | `#8896A8` |
| Accent (Harbor Gold) | `#E8AA42` | `#E8AA42` (unchanged) |
| Success | `#1B9C6B` | `#22B47E` (slightly brighter) |
| Danger | `#DC3545` | `#E85D6A` (slightly brighter) |
| Links | `#1B6B93` | `#3A9CC7` (brighter for contrast) |

### Signature Element in Dark Mode
- Wave contour pattern: strokes switch to `#1B6B93` at 6-10% opacity (slightly more visible than light mode to maintain presence against dark backgrounds)
- Dashboard header image: overlay becomes `rgba(10, 22, 40, 0.90)` — darker, but image still barely visible beneath

### Surface Hierarchy (Dark)
1. **Recedes**: Page background `#0A1628` — deepest, darkest
2. **Default**: Cards `#111D2E` — slightly elevated
3. **Prominent**: Elevated surfaces `#152238` — popovers, dropdowns, active elements
4. **Accent surfaces**: Use 10-12% opacity of the accent color on the card background for highlighted items (e.g., selected invoice row: `rgba(27, 107, 147, 0.12)`)

---

## 10. Assets Inventory

All assets are generated and saved in `public/assets/`.

### Tier 1 — Functional Assets (Hand-written SVG)

| File | Dimensions | Usage | Notes |
|------|-----------|-------|-------|
| `logo.svg` | 48x48 viewBox | Sidebar top, login screen, PDF header | Invoice on waves: navy document with gold header line + teal/navy wave strokes |
| `favicon.svg` | 32x32 viewBox | Browser tab favicon | Simplified version of logo — same concept, fewer details |
| `empty-invoices.svg` | 200x160 viewBox | Empty state: no invoices | Stack of blank invoice cards with dashed plus circle |
| `empty-payments.svg` | 200x160 viewBox | Empty state: no payments | Dollar coin above gentle waves |
| `empty-customers.svg` | 200x160 viewBox | Empty state: no customers | Person silhouette with plus badge, wave accent |
| `wave-pattern.svg` | 400x200 viewBox | Signature background element | Repeating wave contour lines, very low opacity |

### Tier 2 — Decorative Assets (DALL-E Generated)

| File | Dimensions | Usage | Notes |
|------|-----------|-------|-------|
| `hero-marina.png` | 1792x1024 | Login screen right panel | Golden-hour marina with geometric sailboat masts, warm sunset tones. Blends with left panel via gradient overlay. |
| `dashboard-header.png` | 1792x1024 | Dashboard welcome header background | Abstract nautical waves with financial chart elements. Used at ~200px height, cropped, with dark overlay for text legibility. |

### Integration Notes
- **Logo in sidebar**: Render `logo.svg` at 36px width with the wordmark "BillingHub" to the right in DM Serif Display 400, 18px, `#FFFFFF`
- **Favicon**: Convert `favicon.svg` to `.ico` or use `<link rel="icon" type="image/svg+xml">` for modern browsers
- **Hero image**: Set as `background-image` with `background-size: cover`, `background-position: center`. Apply gradient overlay from left to blend with the login form panel.
- **Dashboard header**: `background-size: cover`, cropped to container height (~200px). Apply `rgba(12, 45, 72, 0.85)` overlay. White text on top.
- **Wave pattern**: Use as inline SVG or `background-image` with `repeat-x`. Position at bottom of containers. Adjust opacity with CSS.
- **Empty states**: Center the SVG, add heading + body text + CTA button below. Max container width `400px`.

---

## 11. Chart & Data Visualization Style

### Chart Color Sequence
When multiple data series are needed, use this order:
1. `#1B6B93` (Ocean Teal)
2. `#E8AA42` (Harbor Gold)
3. `#0C2D48` (Deep Navy)
4. `#1B9C6B` (Success Green)
5. `#DC3545` (Danger Red)
6. `#6B7A8D` (Muted Gray)

### Aging Bar Chart Colors
- Current (0-30 days): `#1B9C6B`
- 30 days: `#E8AA42`
- 60 days: `#D4922A`
- 90+ days: `#DC3545`

### Chart Styling
- Grid lines: `#EEF1F6` (light) / `#1C2E42` (dark), 1px
- Axis labels: Inter 500, 11px, `#6B7A8D`
- Tooltip: Card style (white bg, 12px border-radius, shadow), Inter 13px
- Area fills: 10-15% opacity of the stroke color
- Bar radius: `4px` top corners
- Donut charts: `4px` gap between segments, rounded ends

### Revenue Dashboard Specific
- **Total Revenue card**: Number in `#E8AA42`, sparkline in `#1B6B93`
- **Outstanding Balance card**: Number in `#DC3545` if high, `#D4922A` if moderate
- **Collection Rate**: Percentage number, with a small circular progress indicator (arc) in `#1B9C6B`
- **Cash Flow Forecast**: Number in `#0C2D48`, trend arrow + percentage

---

## 12. PDF Invoice Styling

### Invoice PDF Template
- **Header**: Marina logo (left) + "INVOICE" in DM Serif Display 28px (right), `#0C2D48`
- **Accent line**: Full-width 2px line in `#E8AA42` below header
- **Bill to / Invoice details**: Two-column layout, Inter 400 11px
- **Line items table**: Header row in `#0C2D48` background with white text. Clean row borders. Amounts right-aligned.
- **Total section**: Right-aligned, subtotal/tax/total stack. Total row: `#0C2D48` background, white text, Inter 700 16px
- **Footer**: Wave pattern SVG at 5% opacity as decorative element. Marina contact info in Inter 400 10px, `#6B7A8D`
- **Paper**: Standard letter/A4. Margins: 48px top/bottom, 56px sides.
