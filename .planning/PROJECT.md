# BillingHub

## What This Is

A web application for marina operators to unify billing across all revenue streams — slip rental, fuel sales, maintenance charges, guest amenities, and services — into a single invoicing and collections platform. Built as a FonnIT daily showcase demo with realistic data for "Sunset Harbor Marina."

## Core Value

Marina operators can create unified invoices combining multiple revenue streams and track collections with aging visibility — replacing fragmented billing across spreadsheets, paper logs, and separate systems.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Revenue dashboard with KPIs, aging chart, revenue breakdown, collection trends
- [ ] Multi-revenue invoicing combining slip rental, fuel, maintenance, amenities, services
- [ ] Recurring invoice templates and auto-generation
- [ ] Payment tracking with partial payment and payment plan support
- [ ] Collections workflow with aging buckets (30/60/90+), flags, notes
- [ ] Customer accounts with profiles, vessels, slip assignments, balance summaries
- [ ] Customer self-service portal for viewing invoices and statements
- [ ] PDF generation for invoices and account statements
- [ ] Reports: revenue by category, aging, collections, monthly comparison, CSV export
- [ ] Role-based auth: manager, billing_clerk, customer
- [ ] Demo data: 25 customers, 150+ invoices, realistic aging distribution
- [ ] Design system per DESIGN-SPEC.md: nautical theme, dark mode, animations

### Out of Scope

- Online payment processing — demo shows "Pay Now" as coming soon
- Email delivery of invoices/reminders — track status only
- Multi-marina support — single marina instance
- QuickBooks/accounting integration — standalone system
- Mobile native app — responsive web only

## Context

- Part of FonnIT marina tech week (same universe as SlipSync and DockWatch)
- Marina: "Sunset Harbor Marina"
- Will be showcased on LinkedIn — visual quality is critical
- DESIGN-SPEC.md defines mandatory visual identity (nautical theme with Deep Navy, Ocean Teal, Harbor Gold)
- Pre-generated assets exist in public/assets/ (logo, hero images, empty states, wave pattern)
- Demo accounts: manager@billinghub.app, billing@billinghub.app, boater@billinghub.app (all demo1234)
- Today's date: 2026-03-26

## Constraints

- **Tech Stack**: Next.js App Router, Neon Postgres, Drizzle ORM, Tailwind + shadcn/ui, Recharts
- **Database**: Neon Postgres (NOT SQLite) via DATABASE_URL env var
- **Auth**: Session-based with SESSION_SECRET env var
- **Design**: Must follow DESIGN-SPEC.md exactly — colors, typography, components, motion, assets
- **Deploy**: Vercel with custom domain billinghub.demos.fonnit.com
- **Fonts**: DM Serif Display (headings), Inter (body) — Google Fonts
- **Single Session**: Complete entire build in one session

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Neon Postgres over SQLite | Production-grade, required by brief | — Pending |
| Drizzle ORM | Type-safe, lightweight, good Next.js integration | — Pending |
| @react-pdf/renderer for PDFs | Client-side PDF generation, React component model | — Pending |
| Recharts for visualizations | React-native charting, good customization | — Pending |
| Session-based auth over JWT | Simpler for demo, server-side control | — Pending |

---
*Last updated: 2026-03-26 after initialization*
