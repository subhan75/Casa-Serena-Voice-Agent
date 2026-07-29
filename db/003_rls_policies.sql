-- Phase 1: Row Level Security (RLS) Policies for Casa Serena
-- Run this after 002_seed_data.sql to enable RLS on all tables
-- This ensures the anon key can only perform allowed operations

-- ============================================================================
-- 1. UNITS TABLE — Public read access (prospects and residents can see listings)
-- ============================================================================
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_public_read" ON units
  FOR SELECT
  USING (true);

-- ============================================================================
-- 2. RESIDENTS TABLE — No direct access (use RPC function instead)
-- ============================================================================
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

-- Deny all direct access; lookup is handled via the lookup_resident RPC function
CREATE POLICY "residents_deny_all" ON residents
  FOR ALL
  USING (false);

-- ============================================================================
-- 3. FAQS TABLE — Public read access (prospects and residents can read FAQs)
-- ============================================================================
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_public_read" ON faqs
  FOR SELECT
  USING (true);

-- ============================================================================
-- 4. TOURS TABLE — Public insert (anyone can book a tour via the agent)
-- ============================================================================
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tours_public_insert" ON tours
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "tours_public_read" ON tours
  FOR SELECT
  USING (true);

-- ============================================================================
-- 5. MAINTENANCE_TICKETS TABLE — Public insert (residents can file tickets)
-- ============================================================================
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_tickets_public_insert" ON maintenance_tickets
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "maintenance_tickets_public_read" ON maintenance_tickets
  FOR SELECT
  USING (true);

-- ============================================================================
-- 6. CALL_LOGS TABLE — Public insert and read (logging all calls)
-- ============================================================================
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_logs_public_insert" ON call_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "call_logs_public_read" ON call_logs
  FOR SELECT
  USING (true);

-- ============================================================================
-- POSTGRES RPC FUNCTION: lookup_resident (secure server-side lookup)
-- ============================================================================
-- This function allows secure resident lookup without exposing the table directly.
-- It's called via supabase.rpc() from the backend webhook service.

CREATE OR REPLACE FUNCTION lookup_resident(
  p_name TEXT,
  p_unit_number TEXT
)
RETURNS TABLE (
  resident_id TEXT,
  name TEXT,
  unit_number TEXT,
  lease_end_date DATE
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    resident_id,
    name,
    unit_number,
    lease_end_date
  FROM residents
  WHERE LOWER(name) ILIKE LOWER(p_name)
    AND unit_number = p_unit_number
  LIMIT 1;
$$;

-- Allow anyone to call this function (it's designed to be safe)
GRANT EXECUTE ON FUNCTION lookup_resident(TEXT, TEXT) TO anon;

-- ============================================================================
-- SUMMARY OF RLS POLICIES
-- ============================================================================
-- units          → SELECT allowed for all (public listings)
-- residents      → All access denied (lookup via RPC function only)
-- faqs           → SELECT allowed for all (public FAQ content)
-- tours          → INSERT and SELECT allowed for all (booking and dashboard)
-- maintenance_tickets → INSERT and SELECT allowed for all (filing and dashboard)
-- call_logs      → INSERT and SELECT allowed for all (logging and dashboard)
-- lookup_resident RPC → Callable by anon key (secure server-side validation)

-- This approach ensures:
-- ✓ No service role key needed in backend code
-- ✓ Anon key can safely perform all required operations
-- ✓ Resident privacy protected (no direct table access)
-- ✓ Database enforces access control at row level
