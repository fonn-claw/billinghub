---
phase: 04-portal-pdfs-polish
plan: 01
subsystem: portal, pdf
tags: [react-pdf, portal, pdf-generation, customer-portal, self-service]

requires:
  - phase: 02-invoicing-payments
    provides: invoices DAL, customers DAL, payments schema
  - phase: 01-foundation-auth
    provides: session auth, customer role, portal layout

provides:
  - Customer self-service portal with account summary and invoice history
  - Invoice detail page with ownership security check
  - Branded PDF invoice generation with react-pdf
  - PDF download button with dynamic import (ssr:false)
  - Portal DAL (getCustomerByUserId, getPortalSummary)

affects: [04-02-polish]

tech-stack:
  added: ["@react-pdf/renderer"]
  patterns: ["dynamic import with ssr:false for react-pdf", "portal DAL for customer-scoped data access", "server-side ownership check for cross-customer protection"]

key-files:
  created:
    - src/lib/dal/portal.ts
    - src/components/pdf/pdf-fonts.ts
    - src/components/pdf/pdf-styles.ts
    - src/components/pdf/wave-pattern.tsx
    - src/components/pdf/invoice-pdf.tsx
    - src/components/portal/invoice-pdf-link.tsx
    - src/components/portal/pdf-download-button.tsx
    - src/app/(portal)/portal/loading.tsx
    - src/app/(portal)/portal/invoices/[id]/page.tsx
    - src/app/(portal)/portal/invoices/[id]/loading.tsx
  modified:
    - src/app/(portal)/portal/page.tsx
    - package.json

key-decisions:
  - "Used text fallback 'BillingHub' in PDF header instead of Image for logo (react-pdf Image requires absolute URL at render time)"
  - "Portal security enforced via customerId !== customer.id -> notFound() on invoice detail"
  - "PDF fonts registered via side-effect import pattern for react-pdf"
  - "Wave pattern in PDF uses react-pdf SVG primitives (Path with quadratic bezier) instead of external SVG file"

patterns-established:
  - "Portal DAL: getCustomerByUserId resolves session userId to customer record"
  - "PDF dynamic import: PDFDownloadButton -> dynamic(InvoicePDFLink, ssr:false) -> InvoicePDF"
  - "Invoice ownership check: compare invoice.customerId with customer.id, notFound() if mismatch"

requirements-completed: [PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PDF-01, PDF-03]

duration: 4min
completed: 2026-03-27
---

# Phase 4 Plan 1: Customer Portal & Invoice PDF Summary

**Customer self-service portal with account summary, invoice history, branded PDF download, and server-side ownership enforcement using @react-pdf/renderer**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-27T05:22:23Z
- **Completed:** 2026-03-27T05:27:15Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Portal home page shows real account data: current balance, overdue amount, next due date, last payment
- Invoice history table with status badges and links to detail pages
- Invoice detail page with line items, payment history, totals, and server-side ownership check
- Branded PDF generation with DM Serif Display headings, Harbor Gold accent line, line items table, and wave pattern footer
- PDF download via dynamic import to avoid SSR crashes
- Pay Now button disabled with Coming Soon tooltip on both portal pages
- Loading skeletons for both portal routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Portal DAL, account summary page, and invoice history** - `c7646167` (feat)
2. **Task 2: Invoice detail page with PDF download** - `6906d4c9` (feat)

## Files Created/Modified
- `src/lib/dal/portal.ts` - Portal DAL: getCustomerByUserId, getPortalSummary
- `src/app/(portal)/portal/page.tsx` - Account summary + invoice history page (replaced placeholder)
- `src/app/(portal)/portal/loading.tsx` - Loading skeleton for portal home
- `src/app/(portal)/portal/invoices/[id]/page.tsx` - Invoice detail with ownership check + PDF download
- `src/app/(portal)/portal/invoices/[id]/loading.tsx` - Loading skeleton for invoice detail
- `src/components/pdf/pdf-fonts.ts` - Inter + DM Serif Display font registration for react-pdf
- `src/components/pdf/pdf-styles.ts` - Shared PDF stylesheet with DESIGN-SPEC colors
- `src/components/pdf/wave-pattern.tsx` - Wave pattern SVG component for PDF footer
- `src/components/pdf/invoice-pdf.tsx` - Full invoice PDF Document component
- `src/components/portal/invoice-pdf-link.tsx` - PDFDownloadLink wrapper (client component)
- `src/components/portal/pdf-download-button.tsx` - Dynamic import wrapper (ssr:false)
- `package.json` - Added @react-pdf/renderer dependency

## Decisions Made
- Used text "BillingHub" in PDF header rather than Image component for reliability (react-pdf Image requires absolute URL)
- Portal security check uses notFound() rather than redirect for unauthorized invoice access
- Wave pattern in PDF uses react-pdf SVG primitives with quadratic bezier curves
- PDF fonts registered via side-effect import in invoice-pdf.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Portal pages fully functional with real data
- PDF generation infrastructure in place for potential statement PDFs
- Ready for Phase 4 Plan 2 (polish/refinement)

---
*Phase: 04-portal-pdfs-polish*
*Completed: 2026-03-27*
