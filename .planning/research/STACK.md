# Technology Stack

**Project:** BillingHub -- Marina Multi-Revenue Invoicing & Collections Platform
**Researched:** 2026-03-26
**Overall confidence:** HIGH (stack is prescribed by brief; versions verified via npm registry)

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.5.14 | Full-stack framework (App Router) | Stable LTS line. Next.js 16.2.1 exists but is too new for a single-session build -- risk of undocumented breaking changes with shadcn/ui and other deps. 15.x is battle-tested with App Router, Server Actions, and the Vercel deploy pipeline. |
| React | 19.2.4 | UI library | Required by Next.js 15. All key deps (recharts, react-pdf, radix) now support React 19. |
| React DOM | 19.2.4 | DOM rendering | Paired with React 19. |
| TypeScript | ~5.7 | Type safety | Bundled with Next.js. Use strict mode. |

### Database & ORM

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @neondatabase/serverless | 1.0.2 | Neon Postgres driver | Official Neon serverless driver. Works over WebSocket on edge, HTTP on serverless. Required for Neon + Drizzle on Vercel. |
| drizzle-orm | 0.45.1 | Type-safe ORM | Prescribed by brief. Lightweight, SQL-like API, excellent TypeScript inference. Schema-as-code means the schema file IS the documentation. |
| drizzle-kit | 0.31.10 | Migration tooling | Paired with drizzle-orm. Use `drizzle-kit push` for dev, `drizzle-kit generate` + `drizzle-kit migrate` for production. |

### Styling & UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.2 | Utility-first CSS | Industry standard. v4 uses CSS-native config (@theme) instead of tailwind.config.js. Leaner, faster. |
| @tailwindcss/postcss | 4.2.2 | PostCSS integration | Required for Tailwind v4 with Next.js. Replaces the old tailwindcss PostCSS plugin. |
| shadcn/ui | latest (CLI) | Component library | Not an npm package -- installed via `npx shadcn@latest init` and `npx shadcn@latest add`. Generates source code in project. Fully customizable per DESIGN-SPEC.md. |
| Lucide React | 1.7.0 | Icon library | Prescribed by DESIGN-SPEC.md ("use Lucide icons"). Outline style, customizable stroke width. |
| class-variance-authority | 0.7.1 | Component variants | Used by shadcn/ui for variant management. |
| clsx | 2.1.1 | Class name composition | Lightweight conditional class joining. |
| tailwind-merge | 3.5.0 | Tailwind class deduplication | Prevents conflicting Tailwind classes. Used in the `cn()` utility. |
| next-themes | 0.4.6 | Dark mode toggle | Simple theme provider for Next.js App Router. Handles system preference, localStorage, and flash prevention. |

### Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Recharts | 3.8.1 | Dashboard charts | Prescribed by brief. React-native charting built on D3. Supports bar, line, area, donut (pie), and stacked charts needed for revenue dashboard. Good animation support for the draw-in effects specified in DESIGN-SPEC.md. |

### PDF Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @react-pdf/renderer | 4.3.2 | Invoice & statement PDFs | Prescribed by brief. React component model for PDF layout. Supports custom fonts (DM Serif Display, Inter), images (logo), and the styled invoice template from DESIGN-SPEC.md. Renders on server via Server Actions or API routes. |

### Authentication & Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| bcryptjs | 3.0.3 | Password hashing | Pure JS bcrypt. No native compilation issues on Vercel. Use for hashing demo account passwords in seed script. |
| Custom session auth | -- | Session management | Roll a simple cookie-based session using Next.js middleware + encrypted cookies (iron-session or manual AES). Simpler than NextAuth/Auth.js for a demo with 3 fixed accounts and role-based access. No OAuth needed. |

### Validation & Utilities

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 4.3.6 | Schema validation | Runtime validation for Server Actions, form inputs, API boundaries. Integrates with Drizzle for schema inference. |
| date-fns | 4.1.0 | Date manipulation | Lightweight, tree-shakeable. Needed for invoice due dates, aging calculations (30/60/90 days), date formatting, and relative time displays. |

### Development Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| drizzle-kit | 0.31.10 | DB migrations & studio | Schema push, migration generation, Drizzle Studio for DB inspection. |
| @types/bcryptjs | latest | TypeScript types | Type definitions for bcryptjs. |
| tsx | latest | Script runner | For running the seed script (`npx tsx src/db/seed.ts`). |

## Key Architecture Decisions

### Use Next.js 15.x, NOT 16.x
Next.js 16 was recently released. For a single-session demo build where stability matters more than cutting-edge features, 15.5.14 is the right call. It has full App Router support, Server Actions, and proven Vercel deployment. Next.js 16 introduces changes that may have ecosystem compatibility issues with shadcn/ui and other deps.

### Use Tailwind v4, NOT v3
Tailwind v4 is stable at 4.2.2. It uses CSS-native configuration (`@theme` directives in CSS) instead of `tailwind.config.js`. This is simpler and the `npx shadcn@latest init` scaffolding supports it. No reason to use v3.

### Roll Custom Auth, NOT NextAuth/Auth.js
This is a demo with 3 fixed accounts. NextAuth adds complexity (providers, callbacks, adapter config) that provides zero value here. A simple approach: hash passwords in DB, verify on login, set an encrypted HTTP-only cookie with user ID and role, check in middleware. 50 lines of code vs. a framework.

### Use @react-pdf/renderer, NOT html-to-pdf solutions
The brief specifies React component-based PDF generation. @react-pdf/renderer lets you build the invoice template as React components with the exact typography (DM Serif Display, Inter) and colors from DESIGN-SPEC.md. Server-side rendering via Server Actions keeps the client bundle clean.

### Use @neondatabase/serverless, NOT pg/postgres.js
The Neon serverless driver is purpose-built for serverless environments (Vercel). It uses WebSocket connections that work in edge runtime and HTTP for one-shot queries. Regular pg would fail in edge/serverless contexts.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15.5 | Next.js 16.2 | Too new, ecosystem compatibility risk for single-session build |
| ORM | Drizzle | Prisma | Prescribed by brief. Drizzle is also lighter, faster cold starts on serverless. |
| DB Driver | @neondatabase/serverless | postgres.js (postgres) | Neon driver is optimized for serverless. postgres.js needs persistent connections. |
| Auth | Custom session | NextAuth / Auth.js | Overkill for 3 demo accounts. Adds complexity without value. |
| Charts | Recharts | Nivo, Victory, Chart.js | Recharts is prescribed. Also has the best React integration and animation support. |
| PDF | @react-pdf/renderer | puppeteer, jsPDF | Prescribed. Component model matches the stack. puppeteer too heavy for serverless. |
| Icons | Lucide React | Heroicons, Phosphor | Prescribed by DESIGN-SPEC.md. |
| Date lib | date-fns | dayjs, Temporal | date-fns is tree-shakeable, mature, well-typed. dayjs is fine but less TypeScript-friendly. |
| Validation | Zod | Yup, ArkType | Zod is the ecosystem standard for Next.js + Drizzle. Best TypeScript inference. |
| CSS | Tailwind v4 | Tailwind v3, CSS Modules | v4 is stable and simpler. shadcn/ui supports it. |

## Installation

```bash
# Initialize Next.js project
npx create-next-app@15 billinghub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
npm install @neondatabase/serverless drizzle-orm recharts @react-pdf/renderer lucide-react next-themes zod date-fns bcryptjs clsx tailwind-merge class-variance-authority

# Dev dependencies
npm install -D drizzle-kit @types/bcryptjs tsx

# Initialize shadcn/ui (will scaffold components, cn utility, etc.)
npx shadcn@latest init

# Add shadcn components as needed
npx shadcn@latest add button card input table dialog dropdown-menu select tabs badge separator tooltip popover sheet avatar
```

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/billinghub?sslmode=require"
SESSION_SECRET="generate-a-32-plus-char-random-string-here"
```

## Font Setup (Google Fonts)

```typescript
// src/app/layout.tsx
import { DM_Serif_Display, Inter } from 'next/font/google'

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-heading' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
```

## Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

## Version Confidence

| Technology | Version | Confidence | Verification |
|------------|---------|------------|--------------|
| Next.js | 15.5.14 | HIGH | npm registry, latest 15.x line |
| React | 19.2.4 | HIGH | npm registry |
| drizzle-orm | 0.45.1 | HIGH | npm registry |
| drizzle-kit | 0.31.10 | HIGH | npm registry |
| @neondatabase/serverless | 1.0.2 | HIGH | npm registry |
| Tailwind CSS | 4.2.2 | HIGH | npm registry |
| Recharts | 3.8.1 | HIGH | npm registry, React 19 compatible |
| @react-pdf/renderer | 4.3.2 | HIGH | npm registry, React 19 compatible |
| Lucide React | 1.7.0 | HIGH | npm registry |
| Zod | 4.3.6 | HIGH | npm registry |
| date-fns | 4.1.0 | HIGH | npm registry |
| bcryptjs | 3.0.3 | HIGH | npm registry |
| next-themes | 0.4.6 | HIGH | npm registry |

## Sources

- All versions verified against npm registry on 2026-03-26
- Peer dependency compatibility verified for React 19 across all libraries
- Next.js App Router patterns based on Next.js 15 stable documentation
- Drizzle + Neon integration based on Drizzle ORM documentation
