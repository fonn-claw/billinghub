# Phase 1: Foundation & Auth - Research

**Researched:** 2026-03-26
**Domain:** Database schema, session-based auth, design system, application shell, seed data
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire foundation: database schema with Drizzle ORM on Neon Postgres, session-based authentication using iron-session v8 with role-based access control, the application shell (admin sidebar + portal top-bar + auth split-screen layouts), design system initialization per DESIGN-SPEC.md using Tailwind v4 + shadcn/ui, and a comprehensive seed script producing 25 customers, 150+ invoices, and 3 demo accounts with realistic aging distribution.

The stack is well-defined by CONTEXT.md decisions. Key technical finding: iron-session v8 uses iron-webcrypto (Web Crypto API) and works in Next.js edge runtime middleware, enabling session decryption directly in middleware.ts for route protection. Tailwind v4 uses CSS-native `@theme inline` directives instead of tailwind.config.js -- colors are defined as CSS variables in globals.css with `hsl()` wrappers and referenced via `@theme inline { --color-*: var(--*) }`. This is a different pattern than Tailwind v3.

**Primary recommendation:** Build in this order: (1) Next.js project + Tailwind v4 + shadcn/ui + design tokens, (2) Drizzle schema + Neon connection + migrations, (3) iron-session auth + middleware, (4) three route group layouts, (5) seed script. Each layer depends on the previous.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- iron-session with encrypted cookies for session management (no external auth service needed for 3 demo accounts)
- Generic "Invalid email or password" error message (no user enumeration)
- Sessions persist for 7 days, no explicit "remember me" toggle
- Role-based redirect after login: manager/clerk -> /dashboard, customer -> /portal
- Passwords hashed with bcrypt
- Middleware enforces role-based route protection at the server level -- not just UI hiding
- All monetary values stored as integer cents in Postgres (never floats)
- Format to dollars only in the UI presentation layer
- Use Postgres integer type for amounts
- Invoice numbers auto-increment as INV-XXXXX format
- Drizzle ORM with drizzle-kit for migrations
- Use Postgres enums for status fields (invoice_status, payment_method, charge_category, user_role)
- Initialize shadcn/ui and override CSS variables to match DESIGN-SPEC.md color palette
- next/font for loading DM Serif Display (headings) and Inter (body) from Google Fonts
- Tailwind config extended with custom colors: deep-navy, ocean-teal, harbor-gold, and all semantic/surface colors
- Card, Button, Input, Table, Badge components styled per DESIGN-SPEC.md specifications
- Dark mode toggle in sidebar bottom (admin) and top bar (portal) -- uses CSS class strategy
- Signature gradient as reusable utility class
- Admin layout: 260px sidebar (expanded) / 72px (collapsed) with content area
- Customer portal layout: top bar with logo, account name, logout -- no sidebar
- Auth layout: split screen (55/45) for login page
- Sidebar collapses to icon-only at 768px breakpoint, becomes overlay at 640px
- Breadcrumbs generated dynamically from route segments
- Logo rendered from public/assets/logo.svg at 36px with "BillingHub" wordmark
- Wave pattern SVG used as background decoration at 5-8% opacity on login, empty states
- All seed dates relative to new Date() so aging buckets look realistic on any run date
- Idempotent seed: truncate all tables then re-insert
- 25 customers, 150+ invoices, distribution: 60% paid on time, 20% paid late, 15% currently overdue, 5% in collections
- 3 demo accounts: manager@billinghub.app, billing@billinghub.app, boater@billinghub.app (all password: demo1234)

### Claude's Discretion
- Exact Drizzle schema field names and table relationships
- Middleware implementation approach (Next.js middleware.ts vs per-route checks)
- Skeleton loading component design details
- Exact sidebar nav item ordering and grouping

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password | iron-session v8 + bcryptjs for password verification; Server Action for login form submission |
| AUTH-02 | User session persists across browser refresh | iron-session encrypted cookie with 7-day TTL; cookie survives refresh by design |
| AUTH-03 | User can log out from any page | Server Action that destroys iron-session; sidebar/top-bar logout button |
| AUTH-04 | Manager role has full access to all features and reports | Role stored in session cookie; middleware allows all (admin) routes for manager |
| AUTH-05 | Billing clerk can manage invoices, payments, customers but not settings | Middleware role check; clerk excluded from /settings routes |
| AUTH-06 | Customer role can only view own invoices and account info | Middleware restricts customer to (portal) routes; DAL queries filter by customer_id |
| AUTH-07 | Unauthenticated users are redirected to login page | Next.js middleware.ts checks for session cookie; redirects to /login if absent |
| AUTH-08 | Role enforcement at route/middleware level, not just UI hiding | iron-session getIronSession in middleware decrypts cookie and checks role against route pattern |
| UI-01 | App follows DESIGN-SPEC.md color palette | Tailwind v4 CSS variables with @theme inline directive; custom colors defined in globals.css |
| UI-02 | Typography uses DM Serif Display for headings, Inter for body | next/font/google with variable CSS properties --font-heading and --font-body |
| UI-03 | Components styled per DESIGN-SPEC.md | shadcn/ui components with CSS variable overrides matching spec colors, radii, shadows |
| UI-09 | Wave contour pattern used as signature background element | wave-pattern.svg in public/assets/ applied as background-image at low opacity |
| UI-10 | Pre-generated assets integrated | 8 assets in public/assets/ -- logo.svg, favicon.svg, hero-marina.png, dashboard-header.png, wave-pattern.svg, 3 empty states |
| UI-11 | Responsive design (1400px+, 1200px, 768px, 640px breakpoints) | Tailwind responsive utilities; sidebar collapse logic at 768px and 640px |
| UI-12 | Login screen with split layout, hero image, and wave pattern | (auth)/login/page.tsx with 55/45 split; hero-marina.png on right; gradient overlay blending into left panel |
| SEED-01 | Seed creates "Sunset Harbor Marina" with 25 customer accounts | Staged seed script: seedUsers() -> seedCustomers() -> seedInvoices() -> seedPayments() |
| SEED-02 | Seed creates 150+ invoices with realistic distribution | Relative dates anchored to Date.now(); distribution percentages enforced programmatically |
| SEED-03 | Seed creates 3 demo login accounts | bcryptjs hash of "demo1234" for each role account |
| SEED-04 | Seed includes mixed revenue types across invoices | Line items with random category distribution: slip_rental, fuel, maintenance, amenity, service |
| SEED-05 | Seed creates 3 customers with payment plans | Partial payment records with amounts less than invoice total |
| SEED-06 | Seed creates recurring monthly invoices for 15 long-term slip holders | recurring_templates records with monthly frequency; pre-generated invoices from templates |
| SEED-07 | Seed uses relative dates for realistic aging | All dates computed as offsets from current date: subDays, subMonths from date-fns |
</phase_requirements>

## Standard Stack

### Core (Phase 1 Specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.14 | Full-stack framework (App Router) | Latest stable 15.x. Verified via npm registry. |
| React | 19.2.4 | UI library | Required by Next.js 15. |
| TypeScript | ~5.7 | Type safety | Bundled with Next.js. |
| Tailwind CSS | 4.2.2 | Utility-first CSS | v4 uses CSS-native @theme config. |
| @tailwindcss/postcss | 4.2.2 | PostCSS integration | Required for Tailwind v4 with Next.js. |
| drizzle-orm | 0.45.1 | Type-safe ORM | Schema-as-code, PostgreSQL enums, relations. |
| drizzle-kit | 0.31.10 | Migration tooling | push for dev, generate+migrate for prod. |
| @neondatabase/serverless | 1.0.2 | Neon Postgres driver | WebSocket/HTTP for serverless environments. |
| iron-session | 8.0.4 | Session management | Encrypted cookies via Web Crypto API. Edge-runtime compatible. |
| bcryptjs | 3.0.3 | Password hashing | Pure JS, no native compilation. |
| next-themes | 0.4.6 | Dark mode toggle | Class strategy, flash prevention, SSR-safe. |
| zod | 4.3.6 | Schema validation | Login form validation, server action input validation. |
| date-fns | 4.1.0 | Date manipulation | Seed script relative dates, aging calculations. |
| lucide-react | 1.7.0 | Icons | Sidebar nav icons, UI elements per DESIGN-SPEC.md. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Class name composition | Conditional classes in components |
| tailwind-merge | 3.5.0 | Tailwind class deduplication | cn() utility function |
| class-variance-authority | 0.7.1 | Component variants | shadcn/ui variant management |

### Installation

```bash
# Initialize Next.js 15 project
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
npm install @neondatabase/serverless drizzle-orm iron-session bcryptjs lucide-react next-themes zod date-fns clsx tailwind-merge class-variance-authority

# Dev dependencies
npm install -D drizzle-kit @types/bcryptjs tsx

# Initialize shadcn/ui
npx shadcn@latest init

# Add required components
npx shadcn@latest add button card input table badge separator tooltip avatar dropdown-menu sheet
```

## Architecture Patterns

### Project Structure (Phase 1)

```
src/
  app/
    (auth)/
      login/page.tsx           # Split-screen login
      layout.tsx               # Minimal auth layout
    (admin)/
      layout.tsx               # Sidebar shell
      dashboard/page.tsx       # Placeholder for Phase 3
      page.tsx                 # Redirect to dashboard
    (portal)/
      layout.tsx               # Top-bar shell
      page.tsx                 # Redirect to account
    layout.tsx                 # Root layout (fonts, providers)
    globals.css                # Tailwind v4 + design tokens
  components/
    ui/                        # shadcn/ui components (auto-generated)
    layout/
      sidebar.tsx              # Admin sidebar navigation
      top-bar.tsx              # Portal top bar
      breadcrumbs.tsx          # Dynamic breadcrumbs
  lib/
    db/
      schema.ts                # Drizzle schema (all tables)
      index.ts                 # DB connection singleton
      seed.ts                  # Demo data seeding
    auth/
      session.ts               # getSession() helper, session types
      actions.ts               # login/logout Server Actions
    utils.ts                   # cn() helper
    formatting.ts              # formatCurrency, formatDate helpers
  middleware.ts                # Auth + role-based route protection
drizzle.config.ts              # Drizzle Kit config
```

### Pattern 1: iron-session v8 with Next.js 15

**What:** Stateless encrypted cookie sessions using Web Crypto API.
**Key insight:** In Next.js 15, `cookies()` is async -- must be `await cookies()`.

```typescript
// src/lib/auth/session.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  role: "manager" | "billing_clerk" | "customer";
  name: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "billinghub-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
```

**Confidence:** HIGH -- iron-session v8 uses iron-webcrypto for edge runtime compatibility. Version 8.0.4 verified on npm.

### Pattern 2: Middleware Route Protection

**What:** Next.js middleware.ts decrypts iron-session cookie and enforces role-based access.
**Key insight:** iron-session v8 works in edge middleware because it uses Web Crypto API, not Node.js crypto.

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData } from "@/lib/auth/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "billinghub-session",
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/_next") || pathname.startsWith("/assets")) {
    return res;
  }

  // No session -> login
  if (!session.userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Customer can only access /portal routes
  if (session.role === "customer" && !pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  // Non-customers accessing /portal should go to admin
  if (session.role !== "customer" && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
```

**Confidence:** HIGH -- iron-session v8 edge compatibility confirmed via iron-webcrypto dependency.

### Pattern 3: Tailwind v4 Design Token Setup

**What:** CSS-native color system using @theme inline directive.
**Key insight:** Tailwind v4 does NOT use tailwind.config.js. Colors defined as CSS variables with `hsl()` wrappers in globals.css, then mapped to Tailwind utilities via `@theme inline`.

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Primary palette */
  --deep-navy: hsl(207 73% 17%);
  --ocean-teal: hsl(200 67% 34%);
  --harbor-gold: hsl(36 78% 58%);

  /* Semantic */
  --success: hsl(153 67% 36%);
  --warning: hsl(32 67% 50%);
  --danger: hsl(354 64% 54%);

  /* Surfaces */
  --background: hsl(218 33% 97%);
  --card: hsl(0 0% 100%);
  --sidebar-bg: hsl(207 73% 17%);
  --muted: hsl(218 24% 93%);
  --border: hsl(216 22% 85%);

  /* Text */
  --foreground: hsl(207 73% 17%);
  --muted-foreground: hsl(210 11% 55%);

  /* shadcn required tokens */
  --primary: var(--ocean-teal);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: var(--muted);
  --secondary-foreground: var(--foreground);
  --accent: var(--harbor-gold);
  --accent-foreground: var(--deep-navy);
  --destructive: var(--danger);
  --ring: var(--ocean-teal);
  --radius: 0.5rem;
}

.dark {
  --background: hsl(215 42% 10%);
  --card: hsl(215 35% 12%);
  --sidebar-bg: hsl(215 50% 7%);
  --muted: hsl(215 35% 9%);
  --border: hsl(210 30% 18%);
  --foreground: hsl(216 30% 93%);
  --muted-foreground: hsl(210 15% 60%);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-ring: var(--ring);

  /* Custom design-spec colors */
  --color-deep-navy: var(--deep-navy);
  --color-ocean-teal: var(--ocean-teal);
  --color-harbor-gold: var(--harbor-gold);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-sidebar-bg: var(--sidebar-bg);

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

**Confidence:** HIGH -- verified via shadcn/ui official Tailwind v4 documentation.

### Pattern 4: Drizzle Schema with Postgres Enums

**What:** Schema using pgEnum for status fields, integer for money.

```typescript
// src/lib/db/schema.ts
import { pgTable, pgEnum, text, integer, timestamp, boolean, uuid, jsonb, date, real } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["manager", "billing_clerk", "customer"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "partial", "overdue", "collections"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "check", "credit_card", "bank_transfer"]);
export const chargeCategoryEnum = pgEnum("charge_category", ["slip_rental", "fuel", "maintenance", "amenity", "service", "other"]);
export const recurringFrequencyEnum = pgEnum("recurring_frequency", ["monthly", "quarterly", "annual"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id), // nullable -- linked for portal login
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  slipNumber: text("slip_number"),
  dock: text("dock"),
  vesselName: text("vessel_name"),
  vesselType: text("vessel_type"),
  vesselLength: integer("vessel_length"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: text("invoice_number").unique().notNull(), // INV-XXXXX
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotalCents: integer("subtotal_cents").default(0).notNull(),
  taxRate: real("tax_rate").default(0).notNull(), // tax rate as decimal (0.075 = 7.5%)
  taxAmountCents: integer("tax_amount_cents").default(0).notNull(),
  totalCents: integer("total_cents").default(0).notNull(),
  notes: text("notes"),
  recurringTemplateId: uuid("recurring_template_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lineItems = pgTable("line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  category: chargeCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  amountCents: integer("amount_cents").notNull(), // quantity * unitPriceCents
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  amountCents: integer("amount_cents").notNull(),
  method: paymentMethodEnum("method").notNull(),
  reference: text("reference"), // check number, transaction ID
  paymentDate: date("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collectionNotes = pgTable("collection_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  note: text("note").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recurringTemplates = pgTable("recurring_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  lineItems: jsonb("line_items").notNull(), // stored as JSON array
  frequency: recurringFrequencyEnum("frequency").notNull(),
  nextInvoiceDate: date("next_invoice_date").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Confidence:** HIGH -- pgEnum and integer types verified against Drizzle ORM PostgreSQL column types documentation.

### Pattern 5: Neon Database Connection

```typescript
// src/lib/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Confidence:** HIGH -- neon-http driver is the standard for serverless (Vercel). Verified against Drizzle + Neon documentation.

### Pattern 6: Google Fonts with next/font

```typescript
// src/app/layout.tsx
import { DM_Serif_Display, Inter } from "next/font/google";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Apply to <html> element:
// <html className={`${dmSerif.variable} ${inter.variable}`}>
```

### Anti-Patterns to Avoid

- **Storing money as float/real in Postgres:** Use integer cents. The only exception is `tax_rate` which is a percentage (0.075), not money.
- **Using tailwind.config.js with Tailwind v4:** v4 uses CSS-native @theme directives. The file is not needed.
- **Using tailwindcss-animate:** Deprecated. Use tw-animate-css instead.
- **Calling cookies() synchronously in Next.js 15:** Must be `await cookies()`. This is a breaking change from Next.js 14.
- **Using Node.js crypto in middleware:** Edge runtime requires Web Crypto API. iron-session v8 handles this correctly.
- **Storing derived balance on invoices:** Compute balance as `totalCents - SUM(payments.amountCents)`. Never store as a mutable field.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session encryption | Custom AES cookie encryption | iron-session v8 | Handles encryption, serialization, cookie options, edge compatibility |
| Password hashing | Custom bcrypt implementation | bcryptjs | Salt generation, timing-safe comparison |
| Dark mode | Custom localStorage + class toggle | next-themes | SSR flash prevention, system preference detection, class strategy |
| Component primitives | Custom buttons, inputs, cards | shadcn/ui | Accessible, keyboard-navigable, ARIA-compliant |
| CSS class merging | String concatenation | cn() with clsx + tailwind-merge | Resolves conflicting Tailwind classes correctly |
| Date arithmetic | Manual Date math | date-fns (subDays, subMonths, format) | Timezone-safe, immutable, tree-shakeable |

## Common Pitfalls

### Pitfall 1: Tailwind v4 Color Format Confusion
**What goes wrong:** Defining CSS variables without `hsl()` wrapper or using the old `hsl(var(--color))` syntax from Tailwind v3.
**Why it happens:** Most tutorials still reference Tailwind v3 patterns. shadcn/ui documentation has been updated but many examples online are outdated.
**How to avoid:** In Tailwind v4, CSS variables MUST include the `hsl()` wrapper: `--background: hsl(0 0% 100%)`. Then reference via `@theme inline { --color-background: var(--background) }`. Never use `hsl(var(--background))` -- the hsl is already in the variable.
**Warning signs:** Colors showing as transparent or wrong values. Check browser DevTools computed styles.

### Pitfall 2: Next.js 15 Async cookies()
**What goes wrong:** Runtime error or build warning when calling `cookies()` without await.
**Why it happens:** Next.js 15 made `cookies()` async (was synchronous in 14). Many examples and even some library docs show the old synchronous pattern.
**How to avoid:** Always `const cookieStore = await cookies()` in Server Components and Server Actions.
**Warning signs:** TypeScript errors about Promise types, runtime warnings in dev console.

### Pitfall 3: iron-session Middleware Signature
**What goes wrong:** Using `cookies()` from next/headers in middleware instead of `req, res` pattern.
**Why it happens:** iron-session has two signatures: `getIronSession(cookies(), options)` for Server Components and `getIronSession(req, res, options)` for middleware. Using the wrong one causes errors.
**How to avoid:** In middleware.ts, use `getIronSession(req, res, options)` with NextRequest and NextResponse. In Server Components/Actions, use `getIronSession(await cookies(), options)`.

### Pitfall 4: Seed Script Date Drift
**What goes wrong:** All demo invoices end up in the 90+ day aging bucket because dates are hardcoded in the past.
**Why it happens:** Developer hardcodes dates like "2025-09-15" instead of computing relative to now.
**How to avoid:** Use `subDays(new Date(), N)` and `subMonths(new Date(), N)` from date-fns. Build a distribution function that assigns dates across aging buckets: 15% of overdue invoices distributed as ~8% in 30-day, ~4% in 60-day, ~3% in 90+ day buckets.

### Pitfall 5: Drizzle push vs migrate Confusion
**What goes wrong:** Using `drizzle-kit push` in production or `drizzle-kit migrate` in development slows down iteration.
**Why it happens:** Both exist and sound similar.
**How to avoid:** Use `npx drizzle-kit push` for development (directly syncs schema to database, destructive). Use `npx drizzle-kit generate` + `npx drizzle-kit migrate` for production (creates SQL migration files).

### Pitfall 6: shadcn/ui Init Overwrites Custom CSS
**What goes wrong:** Running `npx shadcn@latest init` or adding components overwrites custom color tokens in globals.css.
**Why it happens:** shadcn CLI generates default CSS variable values.
**How to avoid:** Run `npx shadcn@latest init` FIRST, then customize globals.css with DESIGN-SPEC.md colors. When adding components later, review any changes to globals.css and revert unwanted overwrites.

## Code Examples

### Login Server Action

```typescript
// src/lib/auth/actions.ts
"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "./session";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Invalid email or password" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.name = user.name;
  await session.save();

  if (user.role === "customer") {
    redirect("/portal");
  } else {
    redirect("/dashboard");
  }
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
```

### Currency Formatting Utility

```typescript
// src/lib/formatting.ts
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatCurrencyParts(cents: number): { dollars: string; sign: string } {
  const formatted = (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return { dollars: formatted, sign: "$" };
}
```

### Seed Script Structure

```typescript
// src/lib/db/seed.ts
import { subDays, subMonths } from "date-fns";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, customers, invoices, lineItems, payments, recurringTemplates } from "./schema";

async function seed() {
  const now = new Date();

  // 1. Truncate all tables (idempotent)
  await db.delete(payments);
  await db.delete(lineItems);
  await db.delete(invoices);
  await db.delete(recurringTemplates);
  await db.delete(customers);
  await db.delete(users);

  // 2. Create demo users
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const [manager, clerk, boater] = await db.insert(users).values([
    { email: "manager@billinghub.app", passwordHash, name: "Harbor Master", role: "manager" },
    { email: "billing@billinghub.app", passwordHash, name: "Sarah Mitchell", role: "billing_clerk" },
    { email: "boater@billinghub.app", passwordHash, name: "James Cooper", role: "customer" },
  ]).returning();

  // 3. Create 25 customers (link boater user to one customer)
  // 4. Create invoices with relative dates
  // 5. Create line items with mixed categories
  // 6. Create payments (60% paid on time, 20% paid late, etc.)
  // 7. Create recurring templates for 15 long-term holders
  // 8. Create partial payments for 3 customers

  console.log("Seed complete");
}

seed().catch(console.error).finally(() => process.exit(0));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS @theme inline directives | Tailwind v4 (2025) | No config file needed; colors in globals.css |
| tailwindcss-animate | tw-animate-css | shadcn/ui Tailwind v4 migration | Different import syntax |
| cookies() synchronous | await cookies() | Next.js 15 (2024) | Breaking change in Server Components |
| iron-session using Node crypto | iron-session v8 using iron-webcrypto | iron-session 8.0 (2024) | Edge runtime compatible |
| hsl(var(--color)) | CSS var with hsl() wrapper | Tailwind v4 + shadcn/ui | Simpler, no double-wrapping |

## Open Questions

1. **Drizzle neon-http vs neon-serverless adapter**
   - What we know: Drizzle offers both `drizzle-orm/neon-http` and `drizzle-orm/neon-serverless` adapters. HTTP is simpler (one-shot queries). Serverless (WebSocket) supports transactions.
   - What's unclear: Whether the seed script needs the WebSocket adapter for transaction support (truncate + re-insert should be transactional).
   - Recommendation: Use neon-http for the app (most queries are simple reads/writes). For the seed script, use `@neondatabase/serverless` Pool with WebSocket for transaction support if needed, or run deletes/inserts sequentially without a wrapping transaction (acceptable for a seed script).

2. **Sidebar collapse state persistence**
   - What we know: Sidebar collapses at 768px breakpoint and is an overlay at 640px.
   - What's unclear: Whether to persist the user's manual collapse preference in localStorage or session.
   - Recommendation: Use localStorage for collapse preference (simple, no server round-trip). Auto-collapse at breakpoints overrides manual preference.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected -- greenfield project |
| Config file | None -- see Wave 0 |
| Quick run command | TBD after test setup |
| Full suite command | TBD after test setup |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with email/password | integration | Server Action test with mock DB | Wave 0 |
| AUTH-07 | Unauthenticated redirect | integration | Middleware test with missing cookie | Wave 0 |
| AUTH-08 | Role enforcement at middleware | integration | Middleware test with wrong role | Wave 0 |
| SEED-07 | Relative dates in seed | unit | Verify date offsets produce correct aging | Wave 0 |

### Wave 0 Gaps

- [ ] Test framework selection and config (recommend vitest for Next.js 15)
- [ ] `vitest.config.ts` -- vitest configuration
- [ ] Test utilities for iron-session mocking
- [ ] Note: For a single-session demo build, formal tests may be lower priority than manual verification. The seed script itself serves as integration validation.

## Sources

### Primary (HIGH confidence)
- [npm registry](https://www.npmjs.com/) -- All package versions verified 2026-03-26
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) -- CSS variable format, @theme inline directive
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) -- CLI setup
- [Drizzle ORM PostgreSQL column types](https://orm.drizzle.team/docs/column-types/pg) -- pgEnum, integer, uuid, text
- [Drizzle + Neon setup](https://orm.drizzle.team/docs/connect-neon) -- neon-http driver pattern
- [iron-session GitHub](https://github.com/vvo/iron-session) -- v8 API, iron-webcrypto dependency
- [Next.js 15 cookies() async](https://nextjs.org/docs/messages/sync-dynamic-apis) -- Breaking change documentation

### Secondary (MEDIUM confidence)
- [iron-session v8 edge compatibility](https://github.com/vvo/iron-session/releases/tag/v8.0.0) -- iron-webcrypto replaces @hapi/iron
- [Next.js middleware + iron-session](https://github.com/vvo/iron-session/issues/537) -- req/res pattern in middleware

### Tertiary (LOW confidence)
- None -- all critical claims verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry
- Architecture: HIGH -- patterns based on established Next.js 15 App Router, Drizzle, iron-session documentation
- Pitfalls: HIGH -- Tailwind v4 migration confirmed via official shadcn docs; async cookies() confirmed via Next.js docs; iron-session edge support confirmed via iron-webcrypto

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable stack, no fast-moving dependencies)
