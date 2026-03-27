# Phase 4: Portal, PDFs & Polish - Research

**Researched:** 2026-03-27
**Domain:** Customer portal, PDF generation, dark mode, UI polish
**Confidence:** HIGH

## Summary

This phase has three distinct workstreams: (1) a customer self-service portal using existing DAL functions filtered by session user, (2) PDF generation for invoices and account statements using `@react-pdf/renderer` with branded styling, and (3) UI polish including dark mode refinements, page transitions, skeleton loading states, and micro-interactions.

The project already has strong foundations for all three. The portal layout and top bar exist as placeholders. `next-themes` is already installed and integrated with a ThemeProvider and dark mode CSS variables. The primary technical risk is `@react-pdf/renderer` -- it requires client-side-only rendering via `next/dynamic` with `ssr: false`, uses its own SVG primitives (not standard React SVG), and only supports TTF/WOFF fonts (not variable fonts). The wave pattern for PDF footers must be recreated using react-pdf's SVG primitives rather than referencing the external SVG file.

**Primary recommendation:** Structure the work as portal-first (server components reusing existing DAL), then PDF components (client-only with dynamic imports), then polish pass (dark mode, transitions, skeletons) across the whole app.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Portal route group `(portal)` already exists with TopBar layout and auth redirect
- Account summary page at `/portal`: card showing current balance, next due date, last payment date, total overdue
- Invoice history below summary: table of customer's invoices with status badges, amounts, dates
- Invoice detail at `/portal/invoices/[id]`: line items, payment history, status, "Download PDF" button
- "Pay Now" button displayed prominently in Harbor Gold (#E8AA42) but disabled with "Coming Soon" tooltip (PORT-05)
- Portal body text slightly larger (15px) per DESIGN-SPEC.md section 7 for consumer-friendly feel
- Simplified navigation: TopBar with logo, account name, logout -- no sidebar (PORT-04)
- Portal data fetched using existing DAL functions filtered by session.customerId
- Customer can only see their own invoices (enforced server-side, not just UI)
- @react-pdf/renderer for client-side PDF generation (locked decision from PROJECT.md)
- Invoice PDF layout per DESIGN-SPEC.md section 12 (detailed header, accent line, line items table, total section, wave footer)
- Statement PDF for monthly or quarterly period per customer
- next-themes library for theme management with CSS class strategy
- Dark mode colors from DESIGN-SPEC.md section 9
- Page transitions: content area fade-in with slide-up (200ms, ease-out)
- Skeleton shapes mirror exact layout of content they replace

### Claude's Discretion
- @react-pdf/renderer component structure and font registration
- Exact skeleton component implementation (CSS-only vs component library)
- Page transition implementation approach (CSS animations vs layout-level wrapper)
- Statement date range picker design on portal
- Loading.tsx vs Suspense boundary strategy for skeleton placement

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PORT-01 | Customer can view account summary (balance, next due, last payment) | Existing DAL: `getCustomerBalance`, `getCustomerInvoices`, `getCustomerPayments` -- filter via `customers.userId` matching `session.userId` |
| PORT-02 | Customer can view invoice history | Reuse `getCustomerInvoices` DAL, render with existing Table/Badge components |
| PORT-03 | Customer can download invoice PDFs | `@react-pdf/renderer` PDFDownloadLink with dynamic import, client-side only |
| PORT-04 | Portal shows simplified navigation (top bar, no sidebar) | Already implemented: `(portal)/layout.tsx` with TopBar, no sidebar |
| PORT-05 | "Pay Now" button displayed as coming soon | Tooltip component exists, Harbor Gold disabled button pattern |
| PDF-01 | Invoice PDF with marina branding per DESIGN-SPEC.md | react-pdf Document/Page/View/Text primitives, Font.register for Inter, SVG primitives for wave pattern |
| PDF-02 | Monthly/quarterly account statement PDF per customer | Same react-pdf stack, transaction list with running balance, date range picker |
| PDF-03 | PDF includes wave pattern footer and proper styling | react-pdf SVG primitives (Path, Line) to recreate wave pattern -- cannot use external SVG file directly |
| UI-04 | Dark mode with proper color mapping | next-themes already integrated, CSS variables already defined in globals.css for `.dark` class |
| UI-05 | Page transitions with fade-in slide-up | CSS animation on layout content wrapper, 200ms ease-out |
| UI-06 | Micro-interactions on cards, buttons, sidebar items, table rows | Tailwind transition utilities + hover/active pseudo-classes |
| UI-07 | Chart animations per spec | Already configured in Phase 3 Recharts components -- verify/enhance |
| UI-08 | Skeleton loading states matching content layout | Next.js loading.tsx files with CSS pulse animation |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | 4.3.2 | PDF generation (invoices, statements) | Locked decision. React component model for PDFs, client-side rendering |
| next-themes | 0.4.6 | Dark mode theme management | Already installed and integrated in root layout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/dynamic | (bundled) | Dynamic import with ssr:false for PDF components | Required for all @react-pdf/renderer usage in Next.js |
| date-fns | 4.1.0 (installed) | Date formatting in PDFs and statement date ranges | Already in project for date manipulation |
| lucide-react | 1.7.0 (installed) | Icons for dark mode toggle, portal UI | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jsPDF + html2canvas | HTML-to-PDF but no React component model, less control over layout |
| CSS animations for transitions | framer-motion | Overkill for simple fade+slide, adds 30KB+ bundle |
| CSS-only skeletons | react-loading-skeleton | Extra dependency for something achievable with Tailwind animate |

**Installation:**
```bash
npm install @react-pdf/renderer
```

**Version verification:** @react-pdf/renderer 4.3.2 confirmed via npm registry 2026-03-27. next-themes 0.4.6 already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(portal)/
│   ├── layout.tsx              # Already exists - TopBar layout
│   └── portal/
│       ├── page.tsx            # Account summary + invoice list (replace placeholder)
│       ├── loading.tsx         # Skeleton for portal home
│       └── invoices/
│           └── [id]/
│               ├── page.tsx    # Invoice detail with PDF download
│               └── loading.tsx # Skeleton for invoice detail
├── components/
│   ├── pdf/
│   │   ├── invoice-pdf.tsx     # react-pdf Document for invoices
│   │   ├── statement-pdf.tsx   # react-pdf Document for statements
│   │   ├── pdf-fonts.ts        # Font.register() calls
│   │   ├── pdf-styles.ts       # StyleSheet.create() shared styles
│   │   └── wave-pattern.tsx    # SVG wave pattern in react-pdf primitives
│   ├── portal/
│   │   ├── account-summary.tsx # Summary card component
│   │   ├── invoice-table.tsx   # Portal invoice list
│   │   └── download-button.tsx # Dynamic import wrapper for PDFDownloadLink
│   └── ui/
│       └── skeleton.tsx        # Reusable skeleton primitives (if not exists)
├── lib/
│   └── dal/
│       └── portal.ts           # Portal-specific queries (customer lookup by userId)
```

### Pattern 1: Customer Lookup via Session
**What:** Portal pages must resolve the customer record from the session's userId (not a customerId stored in session).
**When to use:** Every portal server component that needs customer data.
**Example:**
```typescript
// src/lib/dal/portal.ts
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCustomerByUserId(userId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .limit(1);
  return customer ?? null;
}
```

**Key insight:** The `customers` table has a `userId` column that links to `users.id`. The seed sets this for the boater user. Session contains `userId` (from users table), so portal must do: `session.userId` -> `customers.userId` -> customer record -> use `customer.id` for all DAL queries.

### Pattern 2: Client-Only PDF with Dynamic Import
**What:** All @react-pdf/renderer components must be loaded client-side only.
**When to use:** Any component that renders PDFDownloadLink or usePDF.
**Example:**
```typescript
// src/components/portal/download-button.tsx
"use client";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Preparing PDF...</span> }
);

// Then use in a client component that receives invoice data as props
```

### Pattern 3: Next.js loading.tsx for Skeleton States
**What:** Use Next.js file-based loading.tsx for automatic Suspense boundaries.
**When to use:** Each route that has async data fetching.
**Example:**
```typescript
// src/app/(portal)/portal/loading.tsx
export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}
```

### Pattern 4: Page Transition Wrapper
**What:** CSS animation applied to layout content area for fade-in slide-up.
**When to use:** Both admin and portal layouts.
**Example:**
```css
/* In globals.css */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-transition {
  animation: page-enter 200ms ease-out;
}
```
Apply the `.page-transition` class to the `<main>` content wrapper in both layouts. Since Next.js App Router re-renders the page component on navigation, the animation triggers naturally.

### Anti-Patterns to Avoid
- **Storing customerId in session:** The session already has userId. Look up the customer record via `customers.userId`. Adding customerId to session creates sync issues if customer-user mapping changes.
- **Server-side PDF rendering:** @react-pdf/renderer must not run during SSR. Always use `next/dynamic` with `ssr: false`. The library depends on browser APIs.
- **Importing SVG files into react-pdf:** react-pdf has its own SVG primitives (`Svg`, `Path`, `Line`, etc.). You cannot use `<img src="wave-pattern.svg">` or import an SVG file. Recreate the wave pattern using react-pdf's SVG components.
- **Using OpenType Variable Fonts in react-pdf:** PDF 2.0 spec does not support variable fonts. Must use static TTF or WOFF weight files for Inter in PDFs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence + system detection | Custom localStorage + media query listener | next-themes (already installed) | Handles hydration mismatch, flash prevention, system preference |
| PDF layout engine | HTML-to-canvas-to-PDF | @react-pdf/renderer | Pixel-perfect PDF layout with React components, proper text rendering |
| Font subsetting for PDF | Manual font embedding | @react-pdf/renderer Font.register | Handles font subsetting, weight fallback automatically |
| Skeleton pulse animation | Custom JS animation | Tailwind `animate-pulse` class | Built-in, consistent, zero JS overhead |

**Key insight:** The polish items (dark mode, transitions, skeletons) are all achievable with CSS/Tailwind -- no additional JS libraries needed beyond what's installed.

## Common Pitfalls

### Pitfall 1: @react-pdf/renderer SSR Crash
**What goes wrong:** Importing @react-pdf/renderer in a server component or non-dynamic import causes "ba.Component is not a constructor" or similar errors.
**Why it happens:** The library relies on browser APIs not available during SSR.
**How to avoid:** Always use `next/dynamic` with `ssr: false` for any component that imports from @react-pdf/renderer. Create a thin client wrapper component.
**Warning signs:** Build errors mentioning "document is not defined" or constructor errors during SSR.

### Pitfall 2: Font Registration Timing
**What goes wrong:** Fonts not appearing in PDF, falling back to Helvetica.
**Why it happens:** Font.register() must be called before any PDF component renders. If called inside a component, it may race with rendering.
**How to avoid:** Create a separate `pdf-fonts.ts` file that calls Font.register() at module level. Import it in any component that uses PDF primitives. Use URL-based font sources (Google Fonts CDN) for reliability.
**Warning signs:** PDF renders but text is in Helvetica instead of Inter.

### Pitfall 3: react-pdf SVG vs Standard SVG
**What goes wrong:** Trying to use standard SVG markup or import SVG files in react-pdf components.
**Why it happens:** react-pdf has its own SVG DSL -- `Svg`, `Path`, `Line`, `Circle` etc. from `@react-pdf/renderer`, not standard React SVG elements.
**How to avoid:** Recreate the wave pattern using react-pdf's SVG primitives. Extract path data from the wave-pattern.svg file and use it in react-pdf `Path` elements.
**Warning signs:** SVG not rendering, blank areas where pattern should be.

### Pitfall 4: Dark Mode Flash (FOUC)
**What goes wrong:** Brief flash of light mode before dark mode applies on page load.
**Why it happens:** SSR renders without theme class, client hydration adds it.
**How to avoid:** Already handled -- `suppressHydrationWarning` is set on `<html>`, and next-themes injects a script to set the class before paint. Verify `attribute="class"` is set on ThemeProvider (it is).
**Warning signs:** Flash of white on dark-mode-preferred page load.

### Pitfall 5: Skeleton Mismatch with Content
**What goes wrong:** Skeleton layout doesn't match actual content, causing jarring layout shift.
**Why it happens:** Skeleton created without reference to actual component dimensions.
**How to avoid:** Make skeleton shapes match exact grid structure, card sizes, and spacing of the real content. Use the same Tailwind classes for layout (grid cols, gaps, padding).
**Warning signs:** Content shifts position when it replaces skeleton.

### Pitfall 6: Portal Security -- UI-Only Filtering
**What goes wrong:** Customer sees other customers' data or can manipulate URLs to access other invoices.
**Why it happens:** Filtering only at UI level, not at DAL/query level.
**How to avoid:** All portal DAL queries must filter by the customer ID resolved from the session. Invoice detail page must verify the invoice belongs to the session's customer before returning data.
**Warning signs:** Customer can access `/portal/invoices/[any-uuid]` and see other customers' invoices.

## Code Examples

### Font Registration for PDF
```typescript
// src/components/pdf/pdf-fonts.ts
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjQ.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjQ.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf",
      fontWeight: 700,
    },
  ],
});

// Note: DM Serif Display is used in the web app for headings but
// for PDF we can use Inter 700 for the "INVOICE" heading since
// DM Serif Display has limited availability as static TTF.
// Alternatively, register DM Serif Display:
Font.register({
  family: "DM Serif Display",
  src: "https://fonts.gstatic.com/s/dmseriftext/v12/rnCu-xZa_krGokauCeNq1wWyafOPXHIJErY.ttf",
  fontWeight: 400,
});
```

**Note:** These are static weight URLs from Google Fonts CDN. The Inter variable font will NOT work with react-pdf -- must use individual static weight TTF files. Verify URLs before use; they may need updating.

### Invoice PDF Document Structure
```typescript
// src/components/pdf/invoice-pdf.tsx
import {
  Document, Page, View, Text, StyleSheet, Svg, Path, Image
} from "@react-pdf/renderer";
import "./pdf-fonts"; // Side-effect import for font registration

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Inter",
    fontSize: 11,
    color: "#0C2D48",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accentLine: {
    height: 2,
    backgroundColor: "#E8AA42",
    marginBottom: 24,
  },
  // ... more styles per DESIGN-SPEC section 12
});

export function InvoicePDF({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header: Logo + INVOICE */}
        <View style={styles.header}>
          <Image src="/assets/logo.svg" style={{ width: 48, height: 48 }} />
          <Text style={{ fontSize: 28, fontWeight: 400, fontFamily: "DM Serif Display" }}>
            INVOICE
          </Text>
        </View>
        <View style={styles.accentLine} />
        {/* Bill To / Invoice Details */}
        {/* Line Items Table */}
        {/* Total Section */}
        {/* Footer with wave pattern */}
      </Page>
    </Document>
  );
}
```

### Wave Pattern in react-pdf SVG Primitives
```typescript
// src/components/pdf/wave-pattern.tsx
import { Svg, Path } from "@react-pdf/renderer";

export function WavePatternPDF({ width = 500, height = 40, opacity = 0.05 }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path
        d={`M0 20 Q${width * 0.125} 10, ${width * 0.25} 20 T${width * 0.5} 20 T${width * 0.75} 20 T${width} 20`}
        stroke="#1B6B93"
        strokeWidth={1.5}
        fill="none"
        opacity={opacity}
      />
      <Path
        d={`M0 30 Q${width * 0.125} 20, ${width * 0.25} 30 T${width * 0.5} 30 T${width * 0.75} 30 T${width} 30`}
        stroke="#0C2D48"
        strokeWidth={1}
        fill="none"
        opacity={opacity}
      />
    </Svg>
  );
}
```

### Dynamic Import Wrapper for PDF Download
```typescript
// src/components/portal/pdf-download-button.tsx
"use client";

import dynamic from "next/dynamic";
import type { InvoiceDetail } from "@/lib/dal/invoices";

const InvoicePDFDownload = dynamic(
  () => import("./invoice-pdf-link").then((mod) => mod.InvoicePDFLink),
  { ssr: false, loading: () => <button disabled className="...">Preparing PDF...</button> }
);

export function PDFDownloadButton({ invoice }: { invoice: InvoiceDetail }) {
  return <InvoicePDFDownload invoice={invoice} />;
}
```

### Dark Mode Badge Adjustments
```css
/* Badge dark mode: backgrounds become 12% opacity of text color */
.dark .badge-paid { background: rgba(27, 156, 107, 0.12); color: #22B47E; }
.dark .badge-overdue { background: rgba(220, 53, 69, 0.12); color: #E85D6A; }
.dark .badge-pending { background: rgba(27, 107, 147, 0.12); color: #3A9CC7; }
```

### Micro-interaction CSS Classes
```css
/* Card hover */
.card-hover {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(12, 45, 72, 0.10);
}

/* Button press */
.btn-press:active {
  transform: translateY(1px);
  filter: brightness(0.95);
  transition: transform 100ms, filter 100ms;
}

/* Table row hover */
.table-row-hover {
  transition: background-color 100ms;
}

/* Badge appear */
@keyframes badge-appear {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.badge-animate {
  animation: badge-appear 150ms ease-out;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @react-pdf/renderer 3.x | 4.x | 2024 | Improved performance, better font handling |
| next-themes 0.3.x | 0.4.x | 2024 | Better App Router support, fewer hydration issues |
| Manual dark mode toggle | next-themes with class strategy | Already set up | Zero additional work for toggle logic |

**Deprecated/outdated:**
- `serverComponentsExternalPackages` config is no longer needed for Next.js 15+ with @react-pdf/renderer (only needed for SSR usage which we avoid via dynamic import)

## Open Questions

1. **Google Fonts Static TTF URLs**
   - What we know: Inter static weight TTF files are available on Google Fonts CDN
   - What's unclear: Exact URLs for each weight may change; the URLs above are approximate
   - Recommendation: Verify the exact URLs by checking the Google Fonts CSS API response, or bundle the TTF files locally in `public/fonts/`

2. **Logo SVG in PDF**
   - What we know: react-pdf `Image` component can render images from URLs
   - What's unclear: Whether it can render SVG files directly or needs PNG fallback
   - Recommendation: Try `Image src="/assets/logo.svg"` first. If it fails, convert logo to PNG and use that in PDFs. react-pdf's Image component supports PNG and JPEG reliably.

3. **DM Serif Display in PDFs**
   - What we know: The DESIGN-SPEC calls for DM Serif Display in the "INVOICE" header text
   - What's unclear: The related Google Fonts family may be "DM Serif Text" -- verify the correct static TTF URL
   - Recommendation: Register the font. If unavailable as static TTF, use Inter 700 as fallback for PDF headings.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none -- see Wave 0 |
| Quick run command | `npm run build` (type-check + build) |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PORT-01 | Customer views account summary | manual-only | Manual: login as boater@, verify summary card shows balance/dates | N/A |
| PORT-02 | Customer views invoice history | manual-only | Manual: verify invoice table renders with correct data | N/A |
| PORT-03 | Customer downloads invoice PDF | manual-only | Manual: click Download PDF, verify file downloads | N/A |
| PORT-04 | Portal simplified navigation | manual-only | Manual: verify TopBar, no sidebar on portal pages | N/A |
| PORT-05 | Pay Now button disabled with tooltip | manual-only | Manual: verify button shows "Coming Soon" tooltip | N/A |
| PDF-01 | Invoice PDF with branding | manual-only | Manual: download PDF, verify header/logo/accent line/line items | N/A |
| PDF-02 | Account statement PDF | manual-only | Manual: generate statement, verify period/transactions | N/A |
| PDF-03 | Wave pattern footer in PDF | manual-only | Manual: verify wave pattern visible in PDF footer | N/A |
| UI-04 | Dark mode color mapping | manual-only | Manual: toggle dark mode, verify all surfaces/text/accents | N/A |
| UI-05 | Page transitions | manual-only | Manual: navigate between pages, verify fade-in slide-up | N/A |
| UI-06 | Micro-interactions | manual-only | Manual: hover cards/buttons/rows, verify animations | N/A |
| UI-07 | Chart animations | manual-only | Manual: load dashboard, verify chart draw-in animations | N/A |
| UI-08 | Skeleton loading states | manual-only | Manual: throttle network, verify skeletons match layouts | N/A |

**Justification for manual-only:** All requirements are visual/UI behaviors (PDF rendering, animations, dark mode). No test framework is installed. The project is a showcase demo -- build verification (`npm run build`) catches type errors and compilation issues. Visual correctness is verified by inspection.

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build` + manual visual inspection
- **Phase gate:** Build passes + all success criteria verified manually

### Wave 0 Gaps
None -- no automated test infrastructure needed for this visual/UI phase. Build verification is sufficient.

## Sources

### Primary (HIGH confidence)
- [react-pdf.org/fonts](https://react-pdf.org/fonts) - Font registration API, supported formats (TTF/WOFF only, no variable fonts)
- [react-pdf.org/compatibility](https://react-pdf.org/compatibility) - Next.js compatibility notes (bug fixed in 14.1.1+, project uses 15.5.14)
- [react-pdf.org/advanced](https://react-pdf.org/advanced) - PDFDownloadLink API
- [react-pdf.org/hooks](https://react-pdf.org/hooks) - usePDF hook API
- [react-pdf.org/svg](https://react-pdf.org/svg) - SVG primitives (Svg, Path, Line, etc.)
- npm registry - @react-pdf/renderer 4.3.2, next-themes 0.4.6 (verified 2026-03-27)

### Secondary (MEDIUM confidence)
- Existing codebase analysis - schema.ts, session.ts, DAL files, globals.css, layout files
- DESIGN-SPEC.md sections 4, 6, 7, 9, 12 - Visual requirements for dark mode, animations, portal, PDF

### Tertiary (LOW confidence)
- Google Fonts CDN TTF URLs for Inter static weights -- may need verification at implementation time

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @react-pdf/renderer is locked decision, next-themes already installed, versions verified
- Architecture: HIGH - Portal layout exists, DAL pattern established, customer-user link in schema verified
- Pitfalls: HIGH - SSR issues well-documented, SVG limitation confirmed in official docs, font format limitation confirmed

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable libraries, project-specific findings)
