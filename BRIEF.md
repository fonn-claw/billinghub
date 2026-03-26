# BillingHub — Marina Multi-Revenue Invoicing & Collections Platform

## Overview
A web application for marina operators to unify billing across all revenue streams — slip rental, fuel sales, maintenance charges, guest amenities, and services — into a single invoicing and collections platform. Built as a FonnIT daily showcase, part of our marina tech week.

## Business Context (from market research)
- Marina operators juggle 3-5 separate billing systems (QuickBooks for accounting, spreadsheets for slip rental, paper logs for fuel, manual tracking for services)
- 15-25% of marina revenue is typically overdue or uncollected due to fragmented billing
- Operators either overpay for full QuickBooks ($180-480/year) or under-bill using spreadsheets
- "One unified invoice could improve collections by 30-40%"
- Multiple revenue streams per customer make reconciliation a nightmare
- Spring billing season is starting — quarterly/annual slip renewals happening NOW

## Target Users
1. **Marina Manager / Owner** — Full billing oversight, revenue reports, collections strategy
2. **Office Admin / Billing Clerk** — Day-to-day invoice creation, payment recording, customer communication
3. **Slip Holder (Customer Portal)** — View invoices, make payments, see account history

## Core Features

### 1. Revenue Dashboard (HERO FEATURE)
- Total revenue overview: current month, YTD, by revenue stream
- Accounts receivable aging: current, 30-day, 60-day, 90-day+ (visual bar chart)
- Collection rate trend over time
- Revenue breakdown by category: slip rental, fuel, maintenance, amenities, other
- Outstanding balance alerts — who owes the most, who's most overdue
- Cash flow forecast: expected payments this month based on due dates

### 2. Multi-Revenue Invoicing
- Create invoices that combine multiple charge types on one bill:
  - Slip rental (monthly/quarterly/annual)
  - Fuel purchases
  - Maintenance charges
  - Amenity fees (pump-out, laundry, Wi-Fi premium, shower)
  - One-off services (bottom cleaning, winterization)
- Recurring invoice templates for monthly slip renters
- Auto-generate invoices from recurring schedules
- Line-item detail with descriptions, quantities, rates
- Tax calculation
- PDF invoice generation with marina branding

### 3. Payment Tracking & Collections
- Record payments: cash, check, credit card, bank transfer
- Partial payment support (payment plans)
- Payment history per customer
- Automated aging: invoices auto-categorize into 30/60/90+ day buckets
- Collections workflow: flag accounts, add notes, track promises to pay
- Payment reminder status tracking (when was last reminder sent)

### 4. Customer Accounts
- Customer profile: contact info, slip assignment, vessels, payment history
- Account balance summary: current charges, pending, overdue, credits
- Statement generation: monthly/quarterly account statements as PDF
- Customer notes: billing-related communication log

### 5. Customer Portal (Self-Service)
- Customer logs in to view their invoices and balance
- Invoice history with PDF download
- See what's due and what's overdue
- (Future: online payment — for demo, show "Pay Now" button as coming soon)

### 6. Reports
- Revenue by category (slip, fuel, maintenance, amenity, service)
- Revenue by dock / slip size
- Aging report (detailed: every overdue invoice with customer, amount, days overdue)
- Collections report (what was collected this month vs outstanding)
- Monthly comparison (this month vs last month vs same month last year)
- Export to CSV

### 7. Auth & Roles
- Role-based access: manager, billing_clerk, customer
- Manager: full access + reports + settings
- Billing clerk: invoices, payments, customer accounts
- Customer: own invoices and statements only

## Demo Data
- Marina: "Sunset Harbor Marina" (same universe as SlipSync and DockWatch)
- 25 customer accounts (mix of long-term slip holders and transient visitors)
- 150+ historical invoices going back 6 months
- Mix of: paid on time (60%), paid late (20%), currently overdue (15%), in collections (5%)
- Recurring monthly invoices for 15 long-term slip holders
- Fuel charges, maintenance charges, and amenity fees mixed in
- 3 customers with payment plans (partial payments)
- Realistic aging distribution across 30/60/90+ day buckets

### Demo Accounts
- manager@billinghub.app / demo1234 — Full manager access (dashboard, reports, all features)
- billing@billinghub.app / demo1234 — Billing clerk (invoices, payments, customers)
- boater@billinghub.app / demo1234 — Customer portal (own invoices, statements)

## Design
- A DESIGN-SPEC.md will be provided with the complete visual identity
- Follow it exactly — colors, typography, components, motion, assets
- All visual assets (logo, illustrations, patterns) will be pre-generated in public/assets/

## Tech Stack
- **Next.js** with App Router
- **Neon Postgres** (NOT SQLite)
- **Drizzle ORM**
- **Tailwind + shadcn/ui** (styled per DESIGN-SPEC.md)
- **Recharts or similar** for dashboard visualizations (styled per DESIGN-SPEC.md)
- Deploy to Vercel with custom domain

## Technical Notes
- DATABASE_URL env var for Neon Postgres
- SESSION_SECRET env var for auth
- Seed script that populates all demo data
- PDF generation for invoices and statements (use @react-pdf/renderer or similar)
