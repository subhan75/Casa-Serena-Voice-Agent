-- Phase 1: Create all six tables for Casa Serena Apartments
-- Run this migration in Supabase SQL editor to create the schema

-- 1. units table (seed data, read-mostly)
CREATE TABLE IF NOT EXISTS units (
  unit_number TEXT PRIMARY KEY,
  bedrooms INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  available_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. residents table (seed data, read-mostly)
CREATE TABLE IF NOT EXISTS residents (
  resident_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_number TEXT NOT NULL REFERENCES units(unit_number),
  lease_end_date DATE NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. faqs table (seed data, read-only)
CREATE TABLE IF NOT EXISTS faqs (
  faq_id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('prospect', 'resident', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. tours table (written by schedule_tour)
CREATE TABLE IF NOT EXISTS tours (
  confirmation_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  unit_number TEXT NOT NULL REFERENCES units(unit_number),
  tour_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. maintenance_tickets table (written by create_maintenance_ticket)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  ticket_id TEXT PRIMARY KEY,
  resident_id TEXT NOT NULL REFERENCES residents(resident_id),
  issue_description TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'complaint')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. call_logs table (written by log_call_summary)
CREATE TABLE IF NOT EXISTS call_logs (
  log_id TEXT PRIMARY KEY,
  caller_type TEXT NOT NULL CHECK (caller_type IN ('PROSPECT', 'RESIDENT')),
  outcome TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_units_available ON units(is_available, available_date);
CREATE INDEX IF NOT EXISTS idx_residents_unit ON residents(unit_number);
CREATE INDEX IF NOT EXISTS idx_residents_name_unit ON residents(name, unit_number);
CREATE INDEX IF NOT EXISTS idx_tours_created ON tours(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_resident ON maintenance_tickets(resident_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_created ON maintenance_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_question ON faqs(question);
