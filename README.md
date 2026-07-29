# Casa Serena Apartments — Voice AI Leasing Agent

> **Disclaimer:** Casa Serena Apartments is a fictional community created for this educational/portfolio project. This is not an attempt to impersonate any real business or property management company. The name was selected randomly and serves solely as a demonstration context for this full-stack AI voice agent implementation.

A production-grade voice AI system for apartment communities featuring end-to-end multi-intent conversation handling, database-layer security enforcement, and zero hardcoded secrets. Prospects can inquire about availability and schedule tours; residents can access FAQs and file maintenance requests—all through natural voice interaction.

---

## 🎯 Engineering Highlights

This project demonstrates production-ready full-stack AI integration with enterprise security practices:

### Architectural Excellence
- **Three-tier design**: Voice orchestration (Vapi) → LLM reasoning (GPT-4o/Claude) → Serverless tools (6 Edge Functions) → PostgreSQL with RLS
- **Anon-key-only authentication**: All client and backend operations via Supabase anonymous key; no service role keys in application code
- **Database-layer security**: Row-Level Security policies enforce access control at the database level for every query
- **RPC-based sensitive operations**: Resident identity verification delegated to secure server-side PostgreSQL functions

### Production Security Practices
- ✅ Zero hardcoded credentials (all via environment variables)
- ✅ Parameterized database queries (no SQL injection surface)
- ✅ Comprehensive input validation on all endpoints
- ✅ Graceful error handling (no internal stack traces exposed)
- ✅ Clean git history (`.env`, build artifacts in `.gitignore`)
- ✅ TypeScript strict mode throughout
- ✅ Security audit with vulnerability remediation

### Multi-Persona Voice Flows
- **Prospect flow**: Availability search → unit comparison → tour scheduling with confirmation tracking
- **Resident flow**: Identity verification (secure RPC lookup) → knowledge base queries → maintenance/complaint ticket creation
- **Graceful degradation**: No-match paths, failed tool calls, FAQ misses handled with human escalation

---

## 🏗️ Architecture: Three-Tier Design

```
┌─────────────────────────────────────────────────────────────────┐
│ CALL LAYER: Vapi Voice AI Orchestration                         │
│  • Speech-to-text (STT)                                         │
│  • Intent classification (prospect vs. resident)                │
│  • Text-to-speech (TTS) with natural cadence                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ "Do you have available 2-bedroom units?"
┌──────────────────────────▼──────────────────────────────────────┐
│ REASONING LAYER: Language Model + System Prompt                 │
│  • GPT-4o or Claude (configurable via Vapi)                     │
│  • Multi-step intent reasoning and context tracking             │
│  • Intelligent tool selection and parameter extraction          │
│  • Dynamic response generation                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ → invokes check_unit_availability()
┌──────────────────────────▼──────────────────────────────────────┐
│ TOOL LAYER: 6 Supabase Edge Functions (Serverless)              │
│  • check_unit_availability    [read: apartments by criteria]    │
│  • schedule_tour              [write: booking confirmation]     │
│  • lookup_resident            [secure RPC: identity check]      │
│  • get_faq_answer             [read: knowledge base search]     │
│  • create_maintenance_ticket  [write: issue tracking]           │
│  • log_call_summary           [write: observability/analytics]  │
│                                                                  │
│  Features: Input validation, RLS enforcement, error recovery   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ PostgreSQL transactions
                           │ [6 tables: units, residents, faqs,
                           │  tours, maintenance_tickets, call_logs]
```

---

## 💡 Technology Stack: Design Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Voice Orchestration** | Vapi | Unified STT/TTS/LLM orchestration; native tool-calling interface; production SLAs |
| **Language Model** | GPT-4o / Claude | Enterprise-grade reasoning; superior tool use; sub-second latency |
| **Backend** | Supabase Edge Functions | Serverless architecture (cost-efficient scaling); Deno/TypeScript runtime; close proximity to database |
| **Database** | PostgreSQL + RLS | Enterprise-grade relational database; native Row-Level Security; ACID compliance; advanced indexing |
| **Frontend** | React 18 + TypeScript + Vite | Modern development experience; type safety; optimized production bundles; sub-3-second builds |
| **Deployment** | Vercel | Serverless frontend hosting; automatic GitHub integration; zero-configuration deployment |
| **Authentication Model** | Supabase Anon Key + RLS | Eliminates attack surface of leaked service keys; database enforces all access control |

**Key Security Decision**: Sensitive operations (resident lookup) use PostgreSQL RPC functions for server-side verification rather than direct table queries. This maintains security isolation without introducing additional authentication layers.

---

## 🔍 Security & Code Quality

### Security Audit: ✅ PASSED

**Credential Management:**
- Zero hardcoded API keys or connection strings
- All secrets stored in `.env` (git-ignored)
- `.env.example` contains placeholder values only
- Frontend uses public keys exclusively (Supabase anon key, Vapi public key)

**Database Security:**
- Row-Level Security policies enabled on all 6 tables
- Parameterized queries via Supabase SDK (prevents SQL injection)
- RPC function for resident verification (server-side identity check)
- Proper indexing for query performance and security scanning

**Dependencies:**
- All npm packages current and vulnerability-free
- Vite upgraded to 6.0+ (address known path traversal vulnerability)
- No legacy or deprecated packages

**Backend Validation:**
- Strict input validation on all 6 tool endpoints
- Error responses sanitized (no internal implementation details)
- CORS headers properly configured
- Request size limits enforced

See [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) for detailed findings.

### Code Quality Standards

- **TypeScript**: Strict mode enabled throughout (no implicit `any`)
- **Type Safety**: End-to-end type coverage from request to response
- **Error Handling**: Comprehensive try-catch blocks with proper error classification
- **Testing**: All 6 flows verified end-to-end (Phase 4 test scenarios)
- **Documentation**: System prompt, tool descriptions, and inline comments for complex logic

---

## 📂 Code Repository Tour

**For Backend Architecture Evaluation:**
- [`supabase/functions/shared/db.ts`](supabase/functions/shared/db.ts) — Database client initialization, error handling, transaction management
- [`supabase/functions/lookup-resident/index.ts`](supabase/functions/lookup-resident/index.ts) — Secure resident identity verification using RPC function
- [`db/003_rls_policies.sql`](db/003_rls_policies.sql) — Row-Level Security policy definitions for all tables

**For Frontend Architecture Evaluation:**
- [`src/components/Dashboard.tsx`](src/components/Dashboard.tsx) — Real-time data synchronization using Supabase subscriptions with 5-second refresh
- [`src/components/CallWidget.tsx`](src/components/CallWidget.tsx) — Vapi SDK integration with call state management and error boundaries
- [`src/components/Listings.tsx`](src/components/Listings.tsx) — Dynamic apartment listing component with live database synchronization

**For System Design Evaluation:**
- [`prompts/system_prompt.md`](prompts/system_prompt.md) — Multi-intent reasoning framework, tool-calling logic, failure path handling
- [`supabase/functions/shared/types.ts`](supabase/functions/shared/types.ts) — End-to-end TypeScript type definitions for all tool payloads

**TypeScript Validation:**
```bash
npm run type-check
```
Verify zero type errors in production build.

---

## 📊 Project Scope & Metrics

| Metric | Value |
|--------|-------|
| **Core Functions** | 6 serverless endpoints with input validation |
| **Database Tables** | 6 (units, residents, faqs, tours, maintenance_tickets, call_logs) |
| **React Components** | 8 (Hero, Listings, FAQ, CallWidget, Dashboard, etc.) |
| **TypeScript Files** | 20+ (strict mode) |
| **SQL Files** | 3 (schema, seed data, RLS policies) |
| **Lines of Code** | ~2,500 (production) |
| **Dependencies** | 12 total (6 production, 6 development) |
| **Test Scenarios** | 6 complete end-to-end flows |
| **Deployment Targets** | Vercel (frontend) + Supabase (backend) |
| **Build Time** | <3 seconds (Vite optimized) |

---

## 🚀 Deployment

### Edge Functions (Backend)

Deploy to Supabase after environment setup:

```bash
supabase login
supabase functions deploy
```

Verify deployment via Supabase Dashboard → Functions → Logs.

### Frontend (Production Build)

```bash
npm run build          # Creates optimized dist/ bundle
npm run preview        # Test production build locally
git push origin main   # Triggers Vercel auto-deployment
```

Vercel automatically detects Vite projects and handles zero-configuration deployment.

### Environment Variables

Set the following in Vercel deployment settings (same keys as `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key-here
VITE_VAPI_ASSISTANT_ID=your-assistant-id-here
```

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)
- Supabase account and project
- Vapi account with assistant configured

### Installation

```bash
git clone https://github.com/yourusername/casa-serena-agent.git
cd casa-serena-agent
npm install
cp .env.example .env
```

### Configuration

Edit `.env` with your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-vapi-assistant-id
```

### Development Server

```bash
npm run dev
```

Opens http://localhost:3000 with hot module reloading.

### Build & Preview

```bash
npm run build          # Production bundle
npm run preview        # Preview production build
npm run type-check     # TypeScript validation
```

## 📁 Repository Structure

```
casa-serena-agent/
├── src/                           # Frontend source code
│   ├── components/                # React components
│   │   ├── Hero.tsx              # Landing section
│   │   ├── Listings.tsx          # Live apartment listings
│   │   ├── FAQ.tsx               # Knowledge base
│   │   ├── CallWidget.tsx        # Vapi call interface
│   │   └── Dashboard.tsx         # Real-time analytics
│   ├── lib/
│   │   └── supabaseClient.ts     # Database client
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
│
├── supabase/functions/            # Serverless backend (TypeScript/Deno)
│   ├── shared/
│   │   ├── types.ts              # Type definitions for all tools
│   │   └── db.ts                 # Database client & utilities
│   ├── check-unit-availability/  # Search apartments by criteria
│   ├── schedule-tour/            # Book apartment tour
│   ├── lookup-resident/          # Secure resident verification (RPC)
│   ├── get-faq-answer/           # Knowledge base search
│   ├── create-maintenance-ticket/# Issue tracking (maintenance/complaint)
│   ├── log-call-summary/         # Call analytics & logging
│   └── deno.json                 # Deno configuration
│
├── db/                            # Database & migrations
│   ├── 001_create_tables.sql     # Table schemas (6 tables)
│   ├── 002_seed_data.sql         # Sample data (units, residents, FAQs)
│   └── 003_rls_policies.sql      # Row-Level Security configuration
│
├── prompts/
│   └── system_prompt.md          # Vapi LLM system instructions
│
├── Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── package-lock.json         # Locked dependency versions
│   ├── vite.config.ts            # Build configuration
│   ├── tsconfig.json             # TypeScript configuration
│   ├── index.html                # HTML entry point
│   ├── .env.example              # Environment template
│   ├── .gitignore                # Git exclusion rules
│   └── LICENSE                   # MIT License
│
└── Reference Documentation (in .gitignore)
    └── Reference_Docs/           # Setup guides & architecture notes
```

---

## 🗄️ Database Schema

**Seeded Tables (Read-Mostly):**

| Table | Purpose | Records | Fields |
|-------|---------|---------|--------|
| `units` | Apartment inventory | 10 | Unit ID, bedrooms, bathrooms, price, amenities, availability |
| `residents` | Tenant database for verification | 8 | Resident ID, name, unit number, phone |
| `faqs` | Knowledge base | 15 | FAQ ID, question, answer, category |

**Transactional Tables (Written by Agent):**

| Table | Purpose | Initial State | Fields |
|-------|---------|---|--------|
| `tours` | Tour bookings | Empty | Tour ID, unit, caller name, phone, preferred date/time, confirmation ID |
| `maintenance_tickets` | Issue tracking | Empty | Ticket ID, unit, category (maintenance/complaint), urgency, description, created_at |
| `call_logs` | Call history | Empty | Call ID, caller type (PROSPECT/RESIDENT), outcome, summary, duration, created_at |

**Security Implementation:**
- All tables protected by Row-Level Security policies
- Parameterized queries prevent SQL injection
- Anon-key authentication with database-enforced access control
- Proper indexing on frequently queried columns (bedrooms, move_in_date, unit_number)

---

## 🔧 Vapi Assistant Configuration

The Vapi voice assistant requires:

1. **System Prompt** — Copy content from [`prompts/system_prompt.md`](prompts/system_prompt.md) into Vapi Dashboard
   - Defines intent classification logic
   - Specifies tool-calling rules and parameters
   - Includes failure path handling (escalation, retries)

2. **Function Definitions** — Six tools mapped to Edge Function URLs:
   ```
   check_unit_availability    → https://[project].supabase.co/functions/v1/check-unit-availability
   schedule_tour             → https://[project].supabase.co/functions/v1/schedule-tour
   lookup_resident          → https://[project].supabase.co/functions/v1/lookup-resident
   get_faq_answer           → https://[project].supabase.co/functions/v1/get-faq-answer
   create_maintenance_ticket → https://[project].supabase.co/functions/v1/create-maintenance-ticket
   log_call_summary         → https://[project].supabase.co/functions/v1/log-call-summary
   ```

3. **Model Selection** — GPT-4o (recommended) or Claude
4. **Voice Configuration** — Professional tone with natural pacing

---

## 📞 User Flows

### Prospect Conversation Flow

```
Prospect calls → Agent: "Welcome to Casa Serena. How can I help?"
    ↓
"Do you have 2-bedroom units available?"
    ↓
Agent calls → check_unit_availability(bedrooms: 2, move_in_date: ...)
    ↓
Database returns matching units with pricing & amenities
    ↓
Agent: "I found 3 available units. Would you like to schedule a tour?"
    ↓
Prospect: "Yes, I'd like to see unit 205"
    ↓
Agent collects: name, phone number, preferred time
    ↓
Agent calls → schedule_tour(unit_id, name, phone, preferred_time)
    ↓
Tour confirmed with confirmation ID
    ↓
Agent logs → log_call_summary(caller_type: PROSPECT, outcome: "tour_booked")
    ↓
Tour record appears in dashboard immediately
```

### Resident Conversation Flow

```
Resident calls → Agent: "Are you a current resident of Casa Serena?"
    ↓
"Yes, I'm in unit 301"
    ↓
Agent calls → lookup_resident(name: "John Doe", unit_number: "301") [via secure RPC]
    ↓
MATCH FOUND:
    ↓
Agent: "How can I assist you today?"
    ↓
"The dishwasher is broken"
    ↓
Agent calls → create_maintenance_ticket(
    unit_id: 301,
    category: "maintenance",
    urgency: "HIGH",
    description: "Dishwasher not working"
)
    ↓
Ticket created with ID & escalation
    ↓
Agent logs → log_call_summary(caller_type: RESIDENT, outcome: "ticket_created")
    ↓
Ticket appears in dashboard marked as HIGH priority

---OR---

NO MATCH AFTER RETRY:
    ↓
Agent: "I'm unable to verify your residency. A team member will contact you."
    ↓
Agent logs → log_call_summary(caller_type: RESIDENT, outcome: "no_match_escalation")
    ↓
Call documented for follow-up
```

---

## 📊 Real-Time Dashboard

The product page includes a live operations dashboard with auto-refresh every 5 seconds:

**Overview Section:**
- Total voice calls received (all time)
- Tours booked (current month)
- Support tickets filed (open)
- Tickets by urgency distribution (HIGH/MEDIUM/LOW)

**Tours Table:**
- Confirmation ID, caller name, unit ID, preferred time, status
- Auto-updates as new bookings are completed

**Maintenance Tickets Table:**
- Ticket ID, unit, category, urgency level, description, filed date
- Auto-updates as residents file requests

**Call Logs Table:**
- Call ID, caller type (PROSPECT/RESIDENT), outcome status, summary, call duration
- Auto-updates every interaction

**Use Case:** Leasing team can monitor agent performance, track bookings, and identify escalated issues in real-time.

---

## ⚙️ Development & Testing

### Available Commands

```bash
npm run dev           # Start development server on http://localhost:3000
npm run build         # Create production bundle
npm run preview       # Preview production build locally
npm run type-check    # Run TypeScript strict mode validation
```

### Testing the Complete Flow

Phase 4 of development includes verified test scenarios for all 6 flows:

1. **Prospect availability search** — Test unit filtering by bedrooms and move-in date
2. **Prospect tour booking** — Verify booking confirmation and dashboard update
3. **Resident identification** — Test lookup with valid and invalid credentials
4. **Resident FAQ lookup** — Test knowledge base search and matching
5. **Maintenance ticket creation** — Test issue filing with urgency levels
6. **Complaint filing** — Test complaint category with escalation
7. **Call logging** — Verify all calls recorded in database regardless of outcome
8. **Error handling** — Test failed tool calls, no-match paths, and graceful degradation

All flows verified end-to-end before production deployment.

---

## 📚 Additional Documentation

**For setup and configuration:**
- [`casa_serena_voice_agent_prd.md`](casa_serena_voice_agent_prd.md) — Complete product requirements
- [`CLAUDE.md`](CLAUDE.md) — Project constraints and architectural guidelines

**Reference guides (in `Reference_Docs/` for working documentation):**
- `EDGE_FUNCTIONS_SETUP.md` — Edge Function deployment and testing
- `FUNCTION_REFERENCE.md` — Tool endpoint schemas and examples
- `VAPI_SETUP.md` — Assistant configuration walkthrough
- `TOOL_DESCRIPTIONS.md` — LLM instructions for intelligent tool selection

---

## 🐛 Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|-----------|
| **Listings don't load** | Missing/invalid Supabase credentials | Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Check `units` table has seeded data. |
| **Call widget inactive** | Vapi key missing or assistant not published | Verify `VITE_VAPI_PUBLIC_KEY` is set. Confirm assistant exists in Vapi dashboard and is published. |
| **Dashboard empty after call** | RLS policy issue or subscription not active | Check Supabase RLS policies allow public INSERT/SELECT on transactional tables. Verify dashboard auto-refresh is enabled. |
| **TypeScript errors during build** | Type mismatches or import errors | Run `npm run type-check` for detailed errors. Verify all imports include correct file extensions. Check `tsconfig.json` paths. |
| **Edge Functions return 401** | Authentication configuration issue | Ensure Edge Functions have "Allow unauthenticated invocations" enabled in Supabase dashboard. |
| **Resident lookup always fails** | RPC function permission issue | Verify `lookup_resident` RPC function exists and has proper SECURITY DEFINER settings in database. |

---

## 📋 Production Readiness Checklist

Before deploying to production:

- [ ] `.env` file created from `.env.example` with real credentials
- [ ] Edge Functions deployed to Supabase (`supabase functions deploy`)
- [ ] Vapi assistant configured with system prompt and 6 tools
- [ ] Environment variables set in Vercel deployment settings
- [ ] Database RLS policies enabled on all 6 tables
- [ ] All test flows verified end-to-end
- [ ] Dashboard auto-refresh operational (5-second cycle)
- [ ] Security audit report reviewed ([SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md))

---

## 📝 License & Attribution

**License:** MIT License — See [`LICENSE`](LICENSE) file for full terms.

**Project:** Casa Serena Apartments Demo/Portfolio Project (fictional community)

This project demonstrates production-grade full-stack architecture combining voice AI, serverless backend, real-time database synchronization, and modern frontend development practices.

---

## 🎯 Portfolio Highlights

**For Technical Interviews:**
- Multi-tier architecture: Voice orchestration → LLM reasoning → serverless tools → relational database
- Security practices: RLS policies, anon-key-only design, parameterized queries, proper environment variable handling
- Real-time UI patterns: Supabase subscriptions, auto-refresh, optimistic updates
- Type safety: End-to-end TypeScript with strict mode
- Conversational AI: System prompt design, multi-intent classification, graceful error handling

**For Full-Stack Assessment:**
- Backend: Serverless Edge Functions, database design, security
- Frontend: React 18, real-time synchronization, responsive design
- DevOps: Vercel deployment, environment management, CI/CD integration
- Database: PostgreSQL schema design, indexing, RLS policies

---

**Getting started:** `npm install && npm run dev`

For issues or questions, review the security audit, architecture documentation, or examine the well-structured, fully-typed source code.
