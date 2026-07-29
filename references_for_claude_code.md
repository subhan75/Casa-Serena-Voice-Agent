# Casa Serena Apartments — Voice AI Agent
## Product Requirements Document (for Claude Code development)

### Document purpose
This PRD is written to be handed directly to Claude Code as the source of truth for building this project. It intentionally includes explicit scope boundaries, data schemas, tool specifications, and acceptance criteria so that an AI coding agent can implement this without needing additional clarifying context. Where a decision has been made to keep MVP scope tight, that is called out explicitly so Claude Code does not over-engineer beyond what's specified.

---

## 1. Overview

### 1.1 Problem statement
Casa Serena Apartments is a fictional apartment community used as a demo scenario. In the real world, apartment communities receive two very different categories of phone calls: prospective tenants asking about availability, pricing, and general community FAQs, and current residents asking apartment-related FAQs or reporting complaints and maintenance issues. Staffing phones to handle both well, 24/7, is expensive and inconsistent. This project builds a single-page product: a website listing the community's apartments (mirroring the same data the agent uses) and an embedded voice AI agent a visitor can call, ask questions about exactly what's on the page, and take real action, checking availability, booking tours, answering FAQs, and filing maintenance requests or complaints, using tool calls against a mock backend.

### 1.2 Goal of this project
This is a portfolio/demo project, not a production system. The goal is to demonstrate a single unified product surface, an apartment listings page with an embedded voice agent, where the agent's answers are always consistent with what the visitor sees on screen because both pull from the same underlying data. Prospective tenants are the primary persona this product is designed around; residents are served well but with a narrower, secondary set of capabilities (FAQs and complaint/maintenance filing only). Complexity should be kept to the minimum needed to prove this end-to-end loop convincingly. Do not add features, tools, or infrastructure beyond what is specified below.

### 1.3 Explicit non-goals (out of scope for MVP)
- No real telephony billing, contracts, or PII handling — all data is mock/seed data.
- No authentication or caller verification beyond a lightweight name/unit match to a mock record.
- No resident account details (balances, payment history, lease document access) — residents are limited to FAQs and complaint/maintenance filing only, per section 2.2.
- No payment processing.
- No emergency escalation routing, SMS/email notifications, or human handoff — noted as a future extension, not built now.
- No admin dashboard UI beyond a simple read-only view of bookings/tickets/logs (see section 6.7) — no editing UI needed.
- No multi-language support.
- No Fair Housing compliance logic beyond a soft constraint in the system prompt (see 5.3) — this is a demo, not a legal-compliance system.
- No FAQ content-management UI — FAQ rows are seeded directly into Supabase, not edited through any interface.

---

## 2. Users / callers (personas)

### 2.1 Prospective tenant ("Prospect") — primary persona
The main user this product is designed for. Visits the page, sees the apartment listings, and calls the agent to ask about what's on screen, availability, pricing, amenities, and general community FAQs, and to schedule a tour. Has no existing account. Example opening line: "Hi, I saw you have a 2-bedroom listed, is it still available?"

### 2.2 Current resident ("Resident") — secondary persona
Served well, but with an intentionally narrower scope than prospects. Can ask apartment-related FAQs (same FAQ content as prospects can access) and can report a complaint or request maintenance. Does not have access to account details, lease documents, or balance information — that's explicitly out of scope (see 1.3). Example opening line: "Hi, my AC isn't working and it's the unit at 204."

---

## 3. Core user flows

### 3.1 Intent classification (first turn, applies to every call)
The agent opens with a greeting and a single open question that lets the caller reveal their intent naturally (e.g. "Thanks for calling Casa Serena Apartments, how can I help you today?"). The agent's system prompt must classify the response into one of two branches: PROSPECT or RESIDENT, before proceeding. If the caller's intent is ambiguous, the agent asks one clarifying question ("Are you currently living at Casa Serena, or are you looking into moving in?") before branching. This classification happens in the reasoning layer (prompt logic), not a separate tool call.

### 3.2 Prospect flow
A prospect caller may want any combination of: browsing/availability questions, general FAQs, and booking a tour. Treat these as available at any point in the conversation, not a rigid sequence — a caller might ask a FAQ, then ask about availability, then book a tour, all in one call.
1. If the caller asks a general question about the community (pet policy, parking, amenities, lease terms, etc.), agent calls `get_faq_answer` and answers using the returned content.
2. If the caller asks about availability or pricing, agent collects bedroom count and rough move-in timeframe, then calls `check_unit_availability` and presents 1-3 matching units naturally in speech (unit number, bedroom count, price, availability date). Since the listings are also visible on the page, the agent's answer should match what's displayed.
3. If the caller wants to proceed with a tour, agent asks for name and phone number, then a preferred tour time, then calls `schedule_tour` with the collected details, and confirms the booked time out loud.
4. Call can end after any of the above, whenever the caller indicates they're done.

### 3.3 Resident flow
1. Agent asks for the caller's name and unit number to do a lightweight identity check.
2. Agent calls `lookup_resident` with those parameters.
3. If no match is found, agent apologizes, asks the caller to double check the unit number, and retries once. If still no match, agent tells the caller a team member will follow up and ends the call gracefully. (No further error handling required beyond this.)
4. If matched, agent asks what they need help with. Two paths from here:
   - **FAQ:** if it's a general apartment-related question, agent calls `get_faq_answer` and answers using the returned content (same FAQ tool and content prospects use).
   - **Complaint or maintenance request:** agent asks 1-2 clarifying questions to establish urgency (e.g. "Is this affecting a working appliance or system right now?") and whether it's a maintenance issue or a general complaint, then calls `create_maintenance_ticket` with resident ID, issue description, category ("maintenance" or "complaint"), and urgency level (LOW / MEDIUM / HIGH — agent's own judgment call, no strict rubric required).
5. Agent confirms the outcome (answer given, or ticket created with a rough expectation like "someone will be in touch within 24 hours") and ends the call.

### 3.4 Call closing (both flows)
Every call ends with the agent calling `log_call_summary`, regardless of flow or outcome, recording caller type, intent, and outcome. This must run even on the no-match/failure path in 3.3 step 3.

---

## 4. System architecture

### 4.1 High-level layers
Three layers only. Do not introduce additional services, queues, or microservices.

**Call layer:** Vapi. Owns the phone number (or Vapi's web-call testing interface, since this is a demo — a real phone number is optional, not required for MVP), handles STT/TTS orchestration, turn-taking, and interruption handling, and invokes the LLM and tools per Vapi's assistant configuration. This layer is configured, not custom-coded.

**Reasoning layer:** A single system prompt running on the LLM configured in Vapi (OpenAI GPT-4o or Claude, either is fine — pick whichever Claude Code has working API access to configure via Vapi's assistant config). This prompt encodes the intent classification and both flows described in section 3. This is the one prompt file to build carefully; see section 5.

**Tool layer:** Six function/tool definitions configured in Vapi (`check_unit_availability`, `schedule_tour`, `lookup_resident`, `get_faq_answer`, `create_maintenance_ticket`, `log_call_summary`), each backed by one HTTP endpoint in a lightweight webhook service that Claude Code will build. See section 6.

### 4.2 Explicit architecture decision: single webhook service
Build one small backend service (Node/Express or a simple set of serverless functions — Claude Code's choice, whichever is faster to stand up) exposing six routes, one per tool. This service reads/writes to the Supabase tables in section 7. Do not split this into multiple services or add a queue/event system — a single service with six routes is sufficient and intentional for this scope.

### 4.3 Data flow for a single tool call
Caller speaks → Vapi transcribes via STT → LLM (per system prompt) decides to call a tool → Vapi sends an HTTP request to the corresponding webhook route → webhook route queries/writes Supabase → webhook returns JSON → Vapi passes the result back to the LLM → LLM incorporates it into a spoken response → Vapi synthesizes speech back to caller.

---

## 5. System prompt requirements

### 5.1 Required structure
The system prompt (to be written as its own file, e.g. `system_prompt.md` or inlined in Vapi's assistant config) must include, in this order: agent identity and tone, the intent classification instruction, the prospect flow instructions, the resident flow instructions, tool-calling rules, and the closing/logging instruction. Claude Code should draft this prompt as an explicit deliverable, not leave it implicit in code comments.

### 5.2 Tool-calling rules to encode explicitly
- Never call a booking or ticket-creation tool until all required parameters for that tool have been collected from the caller in conversation.
- Never fabricate availability, resident data, or confirmation details — only state what a tool call actually returned.
- If a tool call fails or returns an error, tell the caller a team member will follow up rather than pretending the action succeeded.

### 5.3 Soft compliance note
Include a brief instruction that the agent should answer leasing questions only with factual information (price, availability, amenities) and should not offer subjective opinions about neighborhoods, other residents, or who a unit is or isn't suited for. This is a lightweight nod to Fair Housing awareness for realism, not a legal compliance system — a single sentence in the prompt is sufficient.

### 5.4 Tone
Warm, efficient, conversational — not overly scripted or robotic. Should sound like a helpful leasing office employee, not a phone tree.

---

## 6. Tool specifications

Each tool below should be implemented as a Vapi function definition (name, description, parameters schema) plus a corresponding webhook route. Keep request/response payloads flat and simple — no nested objects beyond what's shown.

### 6.1 `check_unit_availability`
Purpose: return mock available units matching criteria.
Parameters: `bedrooms` (integer, required), `move_in_date` (string, ISO date, required).
Returns: array of up to 3 matching unit objects, each with `unit_number`, `bedrooms`, `price`, `available_date`. If none match, return an empty array — the agent's prompt should handle telling the caller nothing is currently available.

### 6.2 `schedule_tour`
Purpose: book a tour for a prospect.
Parameters: `name` (string, required), `phone` (string, required), `unit_number` (string, required), `tour_time` (string, ISO datetime, required).
Returns: `confirmation_id` (string), `tour_time` (echoed back), `status` ("booked").
Side effect: writes a new row to the `tours` table.

### 6.3 `lookup_resident`
Purpose: match a caller to an existing resident record.
Parameters: `name` (string, required), `unit_number` (string, required).
Returns: on match — `resident_id`, `name`, `unit_number`, `lease_end_date`. On no match — `found: false` with no other fields. The agent's prompt handles the retry/apology behavior described in 3.3.

### 6.4 `get_faq_answer`
Purpose: return the answer to a general community/apartment-related question. Used by both prospects and residents.
Parameters: `question` (string, required — the caller's question, passed through as free text; matching logic is up to the implementation, e.g. simple keyword/similarity match against the `faqs` table's `question` column, no need for embeddings/vector search at this scope).
Returns: on match — `answer` (string). On no match — `found: false`. The agent's prompt should handle telling the caller a team member will follow up if no FAQ match is found, rather than fabricating an answer.

### 6.5 `create_maintenance_ticket`
Purpose: log a maintenance issue or general complaint for a matched resident.
Parameters: `resident_id` (string, required), `category` (string enum: "maintenance" | "complaint", required), `issue_description` (string, required), `urgency` (string enum: "LOW" | "MEDIUM" | "HIGH", required).
Returns: `ticket_id` (string), `status` ("created").
Side effect: writes a new row to the `maintenance_tickets` table.

### 6.6 `log_call_summary`
Purpose: record a structured summary of every call for later review.
Parameters: `caller_type` (string enum: "PROSPECT" | "RESIDENT"), `outcome` (string, free text — e.g. "tour booked", "ticket created", "faq answered", "no resident match"), `summary` (string, 1-2 sentence free text summary of the call).
Returns: `log_id` (string).
Side effect: writes a new row to the `call_logs` table. This is primarily for the demo's "quality review" angle — a simple read-only view over this table (see 6.7) is the only UI requirement.

### 6.7 The product page (required, not optional)
This project is a single page, hosted on Vercel and shared directly with recruiters, founders, and prospects alike — the front end is the product, not a separate demo layer bolted on afterward. Build one page with the following sections, top to bottom:

**Intro section:** One or two sentences of context — what this is (an apartment community website with an embedded voice AI agent that can answer questions about listings, general FAQs, and handle resident requests) and what stack it uses (Vapi, plus whichever LLM/STT/TTS were configured). Keep this brief.

**Apartment listings:** A visual listing of units pulled from the same `units` table the agent's `check_unit_availability` tool reads from — unit number, bedrooms, price, availability date, styled as simple cards or a table. This is what a prospect visitor scans before or while talking to the agent, and it must always be consistent with what the agent says, since both read the same source of truth.

**FAQ section:** A visible list of the same FAQ content the `get_faq_answer` tool serves (pet policy, parking, amenities, lease terms, etc.), so a visitor can either read answers directly or ask the agent the same questions out loud.

**Voice agent (central element):** An embedded Vapi web call widget, positioned as the main interactive feature of the page, not a secondary add-on — the whole page is built around a visitor being able to call and ask about exactly what they see above. Include a short recorded demo video near this section as well, showing a real call in progress and the dashboard (below) updating as a result, so any visitor who doesn't want to make a live call still sees the full experience demonstrated.

**Live dashboard:** A cleanly styled (not raw/unstyled) view of the `tours`, `maintenance_tickets`, and `call_logs` tables, refreshed on page load or on a short polling interval, so a visitor using the live call option can watch their own call produce a real row in real time. No editing, filtering, or auth needed — display only.

Styling should be clean and simple — a basic consistent layout, readable typography, and clear section separation is sufficient. This does not need custom illustration or heavy design work, but it must not look like an unstyled dev testing page, since it's the first thing a recruiter, founder, or prospect will see.

---

## 7. Data model (Supabase)

### 7.1 `units` (seed data, read-mostly)
Columns: `unit_number` (text, PK), `bedrooms` (int), `price` (numeric), `available_date` (date), `is_available` (boolean).
Seed with roughly 8-10 rows covering a mix of 1, 2, and 3-bedroom units, some available now and some available in the future, to give the agent realistic variety to work with.

### 7.2 `residents` (seed data, read-mostly)
Columns: `resident_id` (text, PK), `name` (text), `unit_number` (text), `lease_end_date` (date), `phone` (text).
Seed with roughly 6-8 rows.

### 7.3 `tours` (written by `schedule_tour`)
Columns: `confirmation_id` (text, PK), `name` (text), `phone` (text), `unit_number` (text), `tour_time` (timestamp), `created_at` (timestamp, default now).

### 7.4 `maintenance_tickets` (written by `create_maintenance_ticket`)
Columns: `ticket_id` (text, PK), `resident_id` (text), `issue_description` (text), `urgency` (text), `created_at` (timestamp, default now).

### 7.5 `call_logs` (written by `log_call_summary`)
Columns: `log_id` (text, PK), `caller_type` (text), `outcome` (text), `summary` (text), `created_at` (timestamp, default now).

### 7.6 `faqs` (seed data, read-only)
Columns: `faq_id` (text, PK), `question` (text), `answer` (text), `audience` (text enum: "prospect" | "resident" | "both").
Seed with roughly 10-15 rows covering pet policy, parking, amenities, lease terms, guest policy, and similar general community questions. Mark most as `"both"` unless a question is genuinely specific to one audience (e.g. a lease-renewal question would be `"resident"` only).

---

## 8. Tech stack (explicit choices, do not deviate without reason)

- Voice orchestration: Vapi
- LLM: GPT-4o or Claude, configured via Vapi's assistant config (either is acceptable)
- Backend webhook service: Node.js + Express (or serverless functions on Vercel — pick whichever is faster to stand up and deploy)
- Database: Supabase (Postgres)
- Front end: plain HTML/JS or a bare React page — no framework overhead beyond what's needed to render the listings, FAQ, embedded call widget, and dashboard sections described in 6.7

---

## 9. Build phases (recommended order for Claude Code)

**Phase 1 — Data layer.** Set up Supabase, create all six tables from section 7, seed `units`, `residents`, and `faqs` with the sample data described.

**Phase 2 — Webhook service.** Build the six tool routes from section 6 (6.1-6.6), each reading/writing Supabase as specified. Test each route independently with sample requests before wiring up Vapi (e.g. via curl or a REST client) to confirm correct request/response shapes.

**Phase 3 — Vapi configuration.** Use the exact system prompt in section 5.5 (or the `system_prompt.md` file derived from it), configure the six tool/function definitions in Vapi pointing at the Phase 2 webhook routes, and configure the assistant (LLM choice, voice, STT).

**Phase 4 — End-to-end test calls.** Run test calls (via Vapi's web call testing interface) covering: a prospect flow answering a FAQ, a prospect flow ending in a booked tour, a resident flow answering a FAQ, a resident flow ending in a created ticket (try both "maintenance" and "complaint" categories), and a resident flow with a no-match lookup. Confirm `log_call_summary` fires in every case.

**Phase 5 — Product page.** Build the full page described in 6.7: intro section, apartment listings (from `units`), FAQ section (from `faqs`), the embedded Vapi live call widget as the central element, a recorded demo video alongside it, and the styled live dashboard. Record the demo video only after Phase 4's test calls are confirmed working, so the recording shows real, successful calls rather than scripted-looking ones.

**Phase 6 — Deploy and open source.** Deploy the front end to Vercel. Prepare the GitHub repository per section 12 (README, license, environment variable handling) before making the repository public.

---

## 10. Acceptance criteria (definition of done)

- A prospect caller can ask a general FAQ and get a correct answer via `get_faq_answer`, ask about availability and hear real options from `check_unit_availability`, and book a tour via `schedule_tour` — all in one continuous call, without the agent breaking character or fabricating data.
- A resident caller can be matched via `lookup_resident`, then either get a correct FAQ answer or have `create_maintenance_ticket` fire with the correct category ("maintenance" or "complaint") and a reasonable urgency level, in one continuous call.
- A resident flow with a name/unit that doesn't match any seed data is handled gracefully per 3.3 step 3, without the agent crashing the conversation or fabricating a match.
- The apartment listings and FAQ content shown on the page always match what the agent reports when asked the same questions, since both read from the same tables.
- Every completed call, regardless of flow or outcome, results in exactly one row in `call_logs`.
- The live dashboard accurately reflects the current contents of `tours`, `maintenance_tickets`, and `call_logs` after a batch of test calls.

---

## 12. Open source & deployment requirements

Since the repository will be public on GitHub and the live site shared directly with recruiters and founders, treat the following as required, not optional cleanup.

### 12.1 Secrets handling
No API keys (Vapi, Supabase, LLM provider, or otherwise) may ever be committed to the repository, hardcoded in source files, or exposed in client-side code. All secrets go in environment variables, loaded via a `.env` file that is git-ignored. Provide a `.env.example` file listing every required variable name with a placeholder value (no real keys) so anyone cloning the repo knows exactly what to configure. Double-check that the deployed Vercel site does not leak any secret in browser-visible network requests or page source — anything the Vapi web call widget needs client-side should use a public/publishable key only, never a private server-side key.

### 12.2 README (required)
The README is effectively a second, shorter pitch, since recruiters may read it before or instead of visiting the live site. It should include: a one-paragraph project description (what it is and why it was built), a short list of the tech stack, a link to the live Vercel demo, a link to or embed of the recorded demo video, brief setup/run instructions (env vars needed, how to seed Supabase, how to run the webhook service locally), and a short "architecture" section that mirrors section 4 of this PRD at a high level (three layers: call, reasoning, tools) so a technical reader can understand the design in under a minute without reading the full PRD.

### 12.3 License
Include an open source license file (MIT is a reasonable default for a portfolio project) so it's unambiguous that the code is free to view and reference.

### 12.4 Mock data disclosure
Since `units`, `residents`, and `faqs` are all seed/mock data and "Casa Serena Apartments" is a fictional scenario, state this clearly in the README so nobody mistakes it for a real client project or real personal data.

## 13. Notes for Claude Code specifically

- This PRD intentionally caps scope at six tools and three data-writing tables (`tours`, `maintenance_tickets`, `call_logs`), plus three read-mostly seed tables (`units`, `residents`, `faqs`). Resist the urge to add resident account balance lookups, emergency escalation, SMS confirmations, a FAQ content-management UI, or additional tables — these are explicitly out of scope per section 1.3, even if they seem like natural extensions.
- Favor the fastest path to a working end-to-end demo over code elegance — this is a portfolio demo project with a specific narrow purpose, not a production system.
- If Vapi API details or the exact current tool-calling configuration format are unclear or appear to have changed, verify against Vapi's current documentation rather than assuming from general knowledge, since this is a fast-moving product surface.
