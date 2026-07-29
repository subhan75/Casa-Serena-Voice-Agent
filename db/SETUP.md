# Phase 1: Database Setup Guide

This guide walks you through setting up the Casa Serena Apartments database in Supabase.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Note your project URL and API keys (find these in Project Settings → API)

## Setup Steps

### Step 1: Copy Your Supabase Credentials

In the Supabase dashboard:
1. Go to **Settings → API** (left sidebar)
2. Copy your **Project URL** (e.g., `https://xxx.supabase.co`)
3. Copy your **anon public key** and **service_role key**

Add these to `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Create Tables

1. In the Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **+ New Query**
3. Open the file `db/001_create_tables.sql` in this directory
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run**
7. Wait for success message (you should see "Query executed successfully")

**Expected output:** 
- 6 tables created (`units`, `residents`, `faqs`, `tours`, `maintenance_tickets`, `call_logs`)
- 8 indexes created

### Step 3: Seed Sample Data

1. In the Supabase SQL Editor, click **+ New Query** again
2. Open the file `db/002_seed_data.sql`
3. Copy the entire SQL content
4. Paste it into the SQL Editor
5. Click **Run**

**Expected output:**
- 10 units inserted
- 8 residents inserted
- 15 FAQs inserted

### Step 4: Enable Row Level Security (RLS)

1. In the Supabase SQL Editor, click **+ New Query** again
2. Open the file `db/003_rls_policies.sql`
3. Copy the entire SQL content
4. Paste it into the SQL Editor
5. Click **Run**

**Expected output:**
- RLS enabled on all 6 tables
- RLS policies created for each table
- `lookup_resident` RPC function created
- Function permissions granted

**What this does:**
- Secures all tables with Row Level Security
- Allows the anon key to perform only necessary operations
- Protects resident data via a server-side RPC function
- No service role key needed in your backend code

### Step 4: Verify the Setup

Go to the **Table Editor** in Supabase (left sidebar) and verify each table:

| Table | Expected Rows |
|-------|---|
| `units` | 10 |
| `residents` | 8 |
| `faqs` | 15 |
| `tours` | 0 (empty, will be written by tour bookings) |
| `maintenance_tickets` | 0 (empty, will be written by maintenance requests) |
| `call_logs` | 0 (empty, will be written by call logging) |

## Data Schema Summary

### units (apartment listings)
- `unit_number` (PK): e.g., "101", "202"
- `bedrooms`: 1, 2, or 3
- `price`: monthly rent
- `available_date`: when unit becomes available
- `is_available`: boolean flag

### residents (existing tenants)
- `resident_id` (PK): e.g., "RES001"
- `name`: resident's full name
- `unit_number`: which unit they occupy
- `lease_end_date`: when their lease expires
- `phone`: contact number

### faqs (community questions & answers)
- `faq_id` (PK): unique identifier
- `question`: the question text
- `answer`: the answer text
- `audience`: "prospect", "resident", or "both"

### tours (tour bookings, written by agent)
- `confirmation_id` (PK): booking confirmation
- `name`: prospect's name
- `phone`: prospect's phone
- `unit_number`: unit they want to tour
- `tour_time`: scheduled tour datetime
- `created_at`: when booking was made

### maintenance_tickets (maintenance/complaints, written by agent)
- `ticket_id` (PK): unique ticket ID
- `resident_id`: which resident filed it
- `issue_description`: what the issue is
- `urgency`: "LOW", "MEDIUM", or "HIGH"
- `category`: "maintenance" or "complaint"
- `created_at`: when ticket was created

### call_logs (all call records, written by agent)
- `log_id` (PK): unique log ID
- `caller_type`: "PROSPECT" or "RESIDENT"
- `outcome`: brief outcome (e.g., "tour booked", "ticket created")
- `summary`: 1-2 sentence call summary
- `created_at`: when call was completed

## Security Model: RLS + Anon Key

This project uses **Row Level Security (RLS)** with the anon key instead of the service role key. Here's why:

| Table | Policy | Rationale |
|-------|--------|-----------|
| `units` | Public SELECT | Anyone can browse available apartments |
| `residents` | No direct access | Lookup only via `lookup_resident` RPC function (server-side safe) |
| `faqs` | Public SELECT | Anyone can read community FAQs |
| `tours` | Public INSERT/SELECT | Backend can book tours and read dashboard |
| `maintenance_tickets` | Public INSERT/SELECT | Backend can file tickets and read dashboard |
| `call_logs` | Public INSERT/SELECT | Backend can log calls and read dashboard |

**Key benefit:** The database enforces access control, not just your backend code. Even if your webhook code is compromised, RLS policies prevent unauthorized access.

**No service role key needed:** Your backend uses only the anon key. All security is at the database layer.

## Next Steps

Once database setup is complete:
1. Proceed to **Phase 2: Webhook Service** to build the six tool routes
2. Each route will read/write these tables via the Supabase client

## Troubleshooting

**Error: "relation already exists"**
- The SQL uses `CREATE TABLE IF NOT EXISTS`, so this is safe to run multiple times
- If you need to wipe and start fresh, see the cleanup section below

**Error: "violates foreign key constraint"**
- This typically means you're trying to insert a resident with a `unit_number` that doesn't exist
- Ensure `001_create_tables.sql` ran successfully first, then verify the `units` table has 10 rows

### Full Reset (optional)

If you need to start completely fresh, run this in the SQL Editor:

```sql
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS maintenance_tickets CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS residents CASCADE;
DROP TABLE IF EXISTS units CASCADE;
```

Then re-run steps 2 and 3 above.

## Testing RLS Policies

Once RLS is enabled, you can verify the policies are working correctly:

### Test 1: Verify units are readable
```sql
SELECT COUNT(*) FROM units;
-- Should return: 10
```

### Test 2: Verify residents table is blocked
```sql
SELECT * FROM residents LIMIT 1;
-- Should return: error "new row violates row-level security policy"
-- (This is expected behavior - use the RPC function instead)
```

### Test 3: Test the lookup_resident RPC function
```sql
SELECT * FROM lookup_resident('Sarah Mitchell', '102');
-- Should return: resident_id, name, unit_number, lease_end_date
```

### Test 4: Verify FAQs are readable
```sql
SELECT COUNT(*) FROM faqs;
-- Should return: 15
```

### Test 5: Test inserting a tour (anon key should allow this)
```sql
INSERT INTO tours (confirmation_id, name, phone, unit_number, tour_time)
VALUES ('TOUR-TEST-001', 'Test Prospect', '555-1234', '101', NOW() + INTERVAL '7 days')
RETURNING *;
-- Should succeed and return the inserted row
```

### Test 6: Verify tours are readable
```sql
SELECT COUNT(*) FROM tours;
-- Should return: 1 (the test tour we just inserted)
```

### Cleanup: Delete test data
```sql
DELETE FROM tours WHERE confirmation_id = 'TOUR-TEST-001';
```

## How It Works: Backend to Supabase Flow

When your backend webhook calls a function from `lib/supabaseClient.ts`:

1. **Backend calls:** `supabase.from("units").select(...)`
2. **Supabase receives:** Request with anon key
3. **RLS policy checks:** "Can anon key SELECT from units?" → YES
4. **Query executes** and returns data
5. **No service role key needed** anywhere in your code

This is secure because:
- RLS policies enforce access at the database layer
- Anon key has minimal permissions (only what RLS allows)
- No secrets are exposed in your backend code
- Even if attacker compromises your backend, they're limited by RLS

## Verifying Setup is Complete

Check off each step:
- [ ] Created tables with `001_create_tables.sql`
- [ ] Seeded data with `002_seed_data.sql`
- [ ] Enabled RLS with `003_rls_policies.sql`
- [ ] Verified 10 units exist in `units` table
- [ ] Verified 8 residents exist in `residents` table
- [ ] Verified 15 FAQs exist in `faqs` table
- [ ] Tested `lookup_resident` RPC function works
- [ ] Updated `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Confirmed service role key is NOT in `.env` or code
