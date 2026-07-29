# Casa Serena Apartments — Voice AI Leasing Agent

A fully-functional voice AI agent for apartment communities, built as a demo/portfolio project. Prospects can ask about units and book tours; residents can file maintenance requests and complaints—all through natural voice conversation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase project with tables created
- Vapi account with assistant configured
- Git for version control

### Installation (5 minutes)

```bash
# Clone and enter directory
git clone https://github.com/yourusername/casa-serena-agent.git
cd casa-serena-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your credentials
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_VAPI_PUBLIC_KEY
```

### Run Locally

```bash
npm run dev
# Opens http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Architecture Overview

```
Voice Call (Vapi)
    ↓
System Prompt + Tool Definitions (LLM)
    ↓
Six Supabase Edge Functions (serverless backend)
    ↓
PostgreSQL with RLS Policies (secure database)
    ↓
React + Vite Frontend (product page + dashboard)
```

### The Six Tools

1. **check_unit_availability** — Search units by bedrooms and move-in date
2. **schedule_tour** — Book an apartment tour
3. **lookup_resident** — Verify resident by name and unit number (RPC function, secure)
4. **get_faq_answer** — Answer common questions
5. **create_maintenance_ticket** — File maintenance or complaint (categories: LOW/MEDIUM/HIGH urgency)
6. **log_call_summary** — Record every call outcome

## 🏗️ Project Structure

```
casa-serena-agent/
├── src/
│   ├── components/          # React components
│   │   ├── Hero.tsx
│   │   ├── Listings.tsx     # Apartment listings (real-time from DB)
│   │   ├── FAQ.tsx          # FAQ from DB
│   │   ├── CallWidget.tsx   # Vapi embedded call widget
│   │   └── Dashboard.tsx    # Live tours/tickets/calls dashboard
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/functions/      # Edge Functions (Phase 2)
│   ├── check-unit-availability/
│   ├── schedule-tour/
│   ├── lookup-resident/
│   ├── get-faq-answer/
│   ├── create-maintenance-ticket/
│   └── log-call-summary/
├── db/                      # Database schema and seed data
│   ├── 001_create_tables.sql
│   ├── 002_seed_data.sql
│   └── 003_rls_policies.sql
├── prompts/
│   └── system_prompt.md     # Vapi system prompt
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── .env.example
└── README.md
```

## 🗄️ Database Schema

| Table | Purpose | Seeded? |
|-------|---------|---------|
| `units` | Apartments (10 units, 1-3 bed) | ✅ Yes |
| `residents` | Tenant records for RPC lookup (8 residents) | ✅ Yes |
| `faqs` | Policies, amenities, lease terms (15 FAQs) | ✅ Yes |
| `tours` | Booked apartment tours | ❌ Empty |
| `maintenance_tickets` | Resident maintenance/complaints | ❌ Empty |
| `call_logs` | Call history and outcomes | ❌ Empty |

All tables use:
- Row-Level Security (RLS) for database-layer access control
- Anon-key-only authentication (no service role keys)
- Timestamps (created_at, updated_at)
- Proper indexing for performance

## 🔒 Security Model

- **No API keys hardcoded** — All secrets via `.env.local`
- **Anon key only** — Client and backend use Supabase anon key
- **RLS policies** — Database enforces read/write rules
- **RPC function** — Resident lookup via secure server-side function
- **Edge Functions** — Serverless, no auth tokens visible
- **Git-ignored** — `.env` and `node_modules` are excluded

## 📞 Vapi Integration

The Vapi assistant is configured with:
- **System prompt** — Copy from `prompts/system_prompt.md` into Vapi Dashboard
- **Six tools** — Function definitions pointing to Edge Function URLs
- **Model** — GPT-4o (OpenAI) or Claude (Anthropic)
- **Voice** — Warm, professional tone (ElevenLabs or default)

## 🎯 User Flows

### Prospect Flow

1. Call the number or click "Start Call" on the product page
2. Agent asks: "How can I help?"
3. Prospect says: "Do you have 2-bedroom units?"
4. Agent → `check_unit_availability(bedrooms: 2, move_in_date: ...)`
5. Agent presents matching units
6. Prospect says: "I'd like to tour unit 205"
7. Agent collects name, phone, preferred time
8. Agent → `schedule_tour(...)`
9. Agent confirms booking
10. Agent → `log_call_summary(caller_type: "PROSPECT", outcome: "tour booked", ...)`
11. Call ends, tour appears in dashboard

### Resident Flow

1. Resident calls or clicks "Start Call"
2. Agent asks: "Are you a current resident?"
3. Resident says: "Yes, I'm in unit 301"
4. Agent → `lookup_resident(name: "John", unit_number: "301")`
5. If matched:
   - Agent asks: "What can I help with?"
   - Resident says: "The dishwasher is broken"
   - Agent → `create_maintenance_ticket(category: "maintenance", urgency: "HIGH", ...)`
   - Agent confirms ticket created
6. If not matched after retry:
   - Agent says: "A team member will help"
   - Agent → `log_call_summary(..., outcome: "no resident match")`

## 🚢 Deployment

### Local Testing

```bash
npm run dev          # Dev server with hot reload
npm run type-check   # TypeScript validation
npm run build        # Production bundle
```

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo at [vercel.com/new](https://vercel.com/new)
3. Set env vars (VITE_SUPABASE_URL, etc.)
4. Click Deploy — automatic builds on push

Vercel auto-detects Vite projects and handles everything.

### Deploy Edge Functions

Before deploying the frontend, ensure Edge Functions are live:

```bash
# Authenticate with Supabase CLI
supabase login

# Deploy all six functions
supabase functions deploy
```

Check Supabase Dashboard → Functions → Logs to verify they're running.

## 📊 Live Dashboard

The product page includes a real-time dashboard showing:

**Overview Tab:**
- Total calls (inbound voice calls)
- Total tours booked
- Total support tickets
- Tickets by urgency (HIGH/MEDIUM/LOW)

**Tours Tab:**
- Confirmation ID, caller name, unit, tour time
- Auto-updates as new tours are booked

**Tickets Tab:**
- Ticket ID, category, issue description, urgency
- Auto-updates as new tickets are filed

**Calls Tab:**
- Call ID, caller type (PROSPECT/RESIDENT)
- Outcome (tour booked, ticket created, FAQ answered, etc.)
- 1-2 sentence summary

Updates automatically every 5 seconds. Great for monitoring agent performance.

## 🛠️ Development

### Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** CSS Grid/Flexbox (no framework overhead)
- **Database:** Supabase (PostgreSQL + Auth)
- **Backend:** Supabase Edge Functions (Deno/TypeScript)
- **Voice AI:** Vapi (STT/TTS/LLM orchestration)
- **Deployment:** Vercel

### Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Build for production
npm run preview       # Preview production build
npm run type-check    # Run TypeScript checks
```

### Environment Variables

Required in `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_VAPI_PUBLIC_KEY=your-vapi-key
```

See `.env.example` for full list.

## 📖 Documentation

Detailed setup and reference docs:

- **[CLAUDE.md](CLAUDE.md)** — Project constraints and build order
- **[SETUP_DEPENDENCIES.md](SETUP_DEPENDENCIES.md)** — Dependency overview
- **[INSTALL.md](INSTALL.md)** — 5-minute setup guide
- **[EDGE_FUNCTIONS_SETUP.md](EDGE_FUNCTIONS_SETUP.md)** — Deploy and test Edge Functions
- **[FUNCTION_REFERENCE.md](FUNCTION_REFERENCE.md)** — Tool schemas and examples
- **[VAPI_SETUP.md](VAPI_SETUP.md)** — Configure Vapi assistant (if not done yet)
- **[TOOL_DESCRIPTIONS.md](TOOL_DESCRIPTIONS.md)** — LLM descriptions for each tool
- **[PHASE5_SUMMARY.md](PHASE5_SUMMARY.md)** — Product page implementation details

## 🐛 Troubleshooting

### "Failed to load listings"
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Verify `units` table has data (check Supabase Dashboard)
- Check RLS policies allow public SELECT on `units`

### "Call widget shows nothing"
- Verify `VITE_VAPI_PUBLIC_KEY` is set
- Check browser console (F12) for SDK load errors
- Ensure Vapi assistant exists and is published

### "Dashboard shows no data"
- Run a test call first (Phase 4 scenarios)
- Check Supabase Tables for data (tours, maintenance_tickets, call_logs)
- Try clicking "Refresh Now" button

### "Build fails with TS errors"
- Run `npm run type-check` to see specific errors
- Verify all imports use correct file extensions
- Check `tsconfig.json` includes `src` and `lib` directories

## 📝 License

MIT — See LICENSE file for details.

## 🎓 About

This is a demo/portfolio project for **Casa Serena Apartments**, a fictional community. It showcases:

- Voice AI agent architecture
- Serverless backend (Supabase Edge Functions)
- Real-time database sync
- Multi-persona voice flows
- Modern React frontend
- Production-ready security practices

Perfect for demonstrating full-stack development with AI integration.

---

**Ready to run?** Start with `npm install && npm run dev` 🚀

Questions? Check the docs folder or review the code — it's fully commented and open source.
