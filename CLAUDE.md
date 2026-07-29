# CLAUDE.md — Casa Serena Voice AI Agent

This file gives Claude Code the operating context for this repository. The full spec lives in `casa_serena_voice_agent_prd.md` in the repo root — read that first if it's present before starting any work. This file is the condensed, day-to-day reference for how to build and behave while working in this codebase.

## Project in one paragraph
A single-page product for a fictional apartment community, Casa Serena Apartments: a website listing the community's units with an embedded voice AI agent a visitor can call. Prospective tenants are the primary persona — they can ask about listings/pricing, general FAQs, and book tours. Residents are a secondary persona with a narrower scope — FAQs and filing complaints/maintenance requests only. The listings and FAQ content shown on the page are the same data the agent's tool calls read from, so the two stay consistent by construction. This is a demo/portfolio project meant to be shared publicly (Vercel + open source GitHub repo), not a production system.

## Scope discipline — read this before adding anything
This project has a deliberately fixed, narrow scope. Six tools. Three write-tables plus three read-mostly seed tables. One webhook service. One product page. Do not expand scope even when an addition seems small or obviously useful. Specifically, do not add: emergency escalation routing, SMS/email notifications, resident account balance/lease-document access, a FAQ content-management UI, authentication, payment handling, multi-language support, or additional tables beyond the six in the PRD. If something like this seems necessary while building, stop and flag it rather than silently adding it. When in doubt, build the smaller version.

## Tech stack (fixed — do not substitute without asking)
- Voice orchestration: Vapi
- LLM: GPT-4o or Claude via Vapi's assistant config
- Backend: Vercel serverless functions (pick one and stay consistent across all six tool routes — don't mix)
- Database: Supabase (Postgres)
- Front end: plain HTML/JS or a bare React page — no framework overhead beyond what's needed to render the listings, FAQ, embedded call widget, and dashboard sections
- Deployment: Vercel

## Repository structure (expected)
```
/api or /server        — the six tool webhook routes (including log_call_summary)
/lib or /db             — Supabase client + query helpers
/public or /app         — the product page (listings, FAQ, call widget, dashboard)
/prompts                — system_prompt.md (the Vapi assistant system prompt, kept as its own file, not buried in code)
.env.example            — every required env var, placeholder values only
README.md
LICENSE
casa_serena_voice_agent_prd.md
CLAUDE.md
```
Adjust naming to fit whichever framework choice is made, but keep the system prompt as its own reviewable file — never inline a multi-paragraph prompt as a string literal buried in application code.

## Repo hygiene — required from the first commit, not a later cleanup pass
This repo will be open sourced, so it must be clean, well-organized, and reproducible from the very first commit, not tidied up at the end. Structure files into the directories above as you go — do not dump files at the repo root, do not create ad hoc folders outside the structure above without a clear reason, and do not leave stray test scripts, scratch files, or commented-out code in the final repo.

- Any additional `.md` reference or scratch documents Claude Code creates while working (notes, drafts, todo lists, working docs — anything that isn't the PRD, this CLAUDE.md, or the README) must be added to `.gitignore` and must never be committed. Only `README.md`, `casa_serena_voice_agent_prd.md`, and `CLAUDE.md` are meant to be tracked, visible project docs.
- Never read, open, print, or edit the `.env` file directly, under any circumstance, including for debugging. If an env var's value needs to be checked, do so by referencing `.env.example` for the expected variable name, or by asking the user to confirm the value — never by accessing the actual `.env` file's contents.
- Set up `.gitignore` in the first commit (covering `.env`, `node_modules`, build output, and any scratch `.md` files as above), not after other files have already been committed without it.
- Keep commits and folder structure reproducible: someone cloning the repo fresh should be able to follow the README and get the project running without guessing at missing structure or hunting for misplaced files.

## The six tools (build these first, in this order)
1. `check_unit_availability` — read from `units`
2. `schedule_tour` — write to `tours`
3. `lookup_resident` — read from `residents` (lightweight identity check for residents only)
4. `get_faq_answer` — read from `faqs`, used by both prospects and residents
5. `create_maintenance_ticket` — write to `maintenance_tickets`, takes a `category` of "maintenance" or "complaint"
6. `log_call_summary` — write to `call_logs`, called at the end of every flow regardless of outcome

Exact parameters, return shapes, and table columns are specified in PRD section 6 and 7 — follow those exactly rather than inferring reasonable-looking alternatives, since Vapi's function-calling config needs to match the tool schema precisely.

## Build order (follow this, don't parallelize or skip ahead)
1. Supabase tables + seed data (`units`, `residents`, `faqs` seeded; `tours`, `maintenance_tickets`, `call_logs` empty)
2. Webhook routes for all six tools, tested independently (curl/REST client) before touching Vapi
3. Vapi assistant config: system prompt + six tool/function definitions pointing at the webhook routes
4. End-to-end test calls: prospect FAQ, prospect flow to a booked tour, resident FAQ, resident flow to a created ticket (both "maintenance" and "complaint" categories), resident flow with a no-match lookup — confirm `log_call_summary` fires in every case
5. Product page: intro copy, apartment listings (from `units`), FAQ section (from `faqs`), the embedded Vapi live-call widget as the central element, a recorded demo video alongside it (recorded only after step 4 passes), styled live dashboard over the three write-tables
6. Deploy to Vercel, finalize README/LICENSE/.env.example, then make the repo public

Don't jump to the front end or Vapi config before the webhook routes are verified working in isolation — debugging through a live voice call is much slower than debugging a REST endpoint directly.

## System prompt conventions
The system prompt must explicitly instruct the agent to: classify caller intent before branching, keep residents scoped to FAQs and complaint/maintenance filing only (no account/lease details), never call a booking/ticket tool until all required parameters have been collected in conversation, never fabricate an FAQ answer or any other data not returned by a tool call, and admit a team member will follow up if a tool call fails, an FAQ has no match, or a resident lookup has no match after one retry. Keep the prompt's tone instruction simple: warm and efficient, like a helpful leasing office employee, not a scripted phone tree.

## Security — non-negotiable
- No API key (Vapi, Supabase, LLM) is ever committed, hardcoded, or exposed client-side. All secrets via env vars, git-ignored `.env`, documented in `.env.example` with placeholders only. See "Repo hygiene" above — never read or edit `.env` directly.
- The Vapi web call widget on the public page must use a public/publishable key only, never a private server key. Verify this by checking the deployed page's network requests and page source before making the repo public.

## Definition of done
Matches PRD section 10 exactly: both flows completable end-to-end without fabricated data, the no-match resident path handled gracefully, exactly one `call_logs` row per completed call, and the live dashboard accurately reflecting table contents after a batch of test calls. Don't consider a phase done until its specific test calls in the build order above have actually been run, not just "should work."

## When something in this file conflicts with the PRD
The PRD (`casa_serena_voice_agent_prd.md`) is the source of truth for exact schemas, parameters, and requirements. This file is a summary and behavioral guide — if there's ever a discrepancy, defer to the PRD and flag the conflict rather than picking one silently.