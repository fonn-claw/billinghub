# AGENTS.md — Build Instructions

## Context
This is a FonnIT daily build project. Read BRIEF.md for what to build. Read DESIGN-SPEC.md for the MANDATORY visual identity — follow it exactly.

## CRITICAL: Single-Session Build
Complete the ENTIRE app in this single session. Do NOT stop between phases.
Do NOT suggest `/clear` or context resets. Auto-advance through all phases.
Make ALL domain decisions yourself — reasonable defaults, don't block on questions.

## MANDATORY: GSD Methodology
GSD is REQUIRED. Never skip it. Never "just code it directly."

## MANDATORY: Follow DESIGN-SPEC.md
The design spec is NOT optional. Every color, font, component style, motion effect, and asset reference in DESIGN-SPEC.md MUST be implemented. Do not fall back to default shadcn styling. The pre-generated assets in public/assets/ must be used exactly as documented.

## Domain Decisions
Make ALL domain and business logic decisions yourself using reasonable defaults.
Do NOT ask questions or wait for clarification. Keep building.

## Methodology
Use GSD (get-shit-done) for the full build lifecycle:
1. Initialize: /gsd:new-project --auto @BRIEF.md (use all recommended defaults)
2. For EACH phase: discuss → ui-spec (if frontend) → plan → execute → verify
3. Auto-advance through ALL phases without human intervention
4. After all phases: /gsd:ship

## UI Quality
This app will be showcased on LinkedIn. Follow DESIGN-SPEC.md exactly.
Use the specified Google Fonts, color palette, component styles, and motion effects.
The pre-generated assets in public/assets/ are ready to use — reference them as documented in DESIGN-SPEC.md.

## Standards
- Demo data seeded and realistic
- Build must pass before handoff
- Responsive design (tablet-friendly)
- Database: Neon Postgres (NOT SQLite)

## Deploy
When finished, push to GitHub:
- git remote add origin https://github.com/fonn-claw/billinghub.git
- git push -u origin main

Then deploy to Vercel:
- npx vercel --yes
- npx vercel domains add billinghub.demos.fonnit.com
- npx vercel --prod

Set required env vars on Vercel:
- DATABASE_URL (Neon connection string)
- SESSION_SECRET (generate a 32+ char random string)

## On Completion
When completely finished, run:
openclaw system event --text "BUILD COMPLETE: BillingHub — Marina Multi-Revenue Invoicing" --mode now
