# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-26)

**Core value:** Marina operators can create unified invoices combining multiple revenue streams and track collections with aging visibility
**Current focus:** Phase 1: Foundation & Auth

## Current Position

Phase: 1 of 4 (Foundation & Auth)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-03-26 -- Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Schema must use integer cents or numeric(10,2) for money -- never floats
- Derive invoice balance from total minus sum of payments -- never store as mutable field
- Seed script uses relative dates anchored to current date for realistic aging
- Prototype @react-pdf/renderer early to catch SSR issues

### Pending Todos

None yet.

### Blockers/Concerns

- @react-pdf/renderer SSR compatibility with Next.js 15 App Router needs verification (Phase 4)
- Tailwind v4 + shadcn/ui integration is newer -- verify during Phase 1 setup

## Session Continuity

Last session: 2026-03-26
Stopped at: Roadmap created, ready to plan Phase 1
Resume file: None
