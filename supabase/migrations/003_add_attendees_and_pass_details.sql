-- ============================================================
-- Migration 003: Dedicated Attendee Details Per Ticket Pass
-- Stores individual attendee name, NIC, and phone on every ticket pass
-- ============================================================

-- 1. Add jsonb fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS additional_attendees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_event_request JSONB DEFAULT '{}'::jsonb;

-- 2. Add individual attendee fields to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attendee_name TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attendee_nic TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attendee_phone TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS pass_index INTEGER DEFAULT 1;

-- 3. Dedicated ATTENDEES table for per-pass entry management
CREATE TABLE IF NOT EXISTS attendees (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id     UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  ticket_id      UUID REFERENCES tickets(id) ON DELETE CASCADE,
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  pass_index     INTEGER NOT NULL DEFAULT 1,
  full_name      TEXT NOT NULL,
  nic_number     TEXT,
  phone          TEXT,
  email          TEXT,
  status         TEXT DEFAULT 'issued',
  checked_in     BOOLEAN DEFAULT false,
  checked_in_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for attendees table
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendees_all" ON attendees FOR ALL USING (true) WITH CHECK (true);
