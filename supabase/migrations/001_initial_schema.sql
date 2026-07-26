-- ============================================================
-- Ideofest — Supabase PostgreSQL Initial Migration
-- Copy-paste this ENTIRE file into Supabase SQL Editor and click RUN.
-- ============================================================

-- 1. CLEAN RESET (optional: drops old partial tables if re-running after an error)
DROP TABLE IF EXISTS audit_logs, email_logs, notifications, attendance_logs, tickets, bookings, ticket_tiers, events, customers CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. ENUMS
DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft','published','sold_out','cancelled','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_category AS ENUM ('music','tech','art','business','food','sports','wellness','community');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_tier_name AS ENUM ('free','early_bird','standard','vip');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','pending_verification','paid','failed','rejected','refunded','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending','pending_verification','confirmed','cancelled','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('bank_transfer','payhere','free');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('issued','used','cancelled','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. HELPER FUNCTIONS (Must be defined BEFORE tables use them as DEFAULT)
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'IDF-' || UPPER(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'IDF-TKT-' || UPPER(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_sold(tier_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE ticket_tiers
  SET sold = sold + qty
  WHERE id = tier_id;
END;
$$ LANGUAGE plpgsql;

-- 5. TABLES

-- CUSTOMERS TABLE (Guest or Registered Users)
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  nic_number      TEXT,
  address_line_1  TEXT,
  address_line_2  TEXT,
  city            TEXT,
  district        TEXT,
  postal_code     TEXT,
  country         TEXT DEFAULT 'Sri Lanka',
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  company         TEXT,
  job_title       TEXT,
  is_guest        BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS TABLE
CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  tagline           TEXT,
  description       TEXT NOT NULL,
  category          event_category NOT NULL,
  date              TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ,
  venue             TEXT NOT NULL,
  city              TEXT NOT NULL,
  country           TEXT DEFAULT 'Sri Lanka',
  image_url         TEXT NOT NULL,
  gallery_urls      TEXT[] DEFAULT '{}',
  organizer_id      TEXT DEFAULT 'admin',
  organizer_name    TEXT DEFAULT 'Ideomint',
  status            event_status DEFAULT 'draft',
  payment_methods   payment_method[] DEFAULT ARRAY['bank_transfer']::payment_method[],
  bank_name         TEXT,
  bank_account_name TEXT,
  bank_account_no   TEXT,
  bank_branch       TEXT,
  tags              TEXT[] DEFAULT '{}',
  featured          BOOLEAN DEFAULT false,
  guest_booking_allowed BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET TIERS TABLE
CREATE TABLE ticket_tiers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        ticket_tier_name NOT NULL,
  label       TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency    TEXT DEFAULT 'LKR',
  capacity    INTEGER NOT NULL,
  sold        INTEGER DEFAULT 0,
  perks       TEXT[] DEFAULT '{}',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref         TEXT NOT NULL UNIQUE DEFAULT generate_booking_ref(),
  event_id            UUID NOT NULL REFERENCES events(id),
  ticket_tier_id      UUID NOT NULL REFERENCES ticket_tiers(id),
  customer_id         UUID REFERENCES customers(id),
  -- Snapshot fields
  event_title         TEXT NOT NULL,
  event_date          TIMESTAMPTZ NOT NULL,
  event_slug          TEXT NOT NULL,
  venue               TEXT NOT NULL,
  -- Customer snapshot
  attendee_name       TEXT NOT NULL,
  attendee_email      TEXT NOT NULL,
  attendee_phone      TEXT,
  attendee_nic        TEXT,
  address_line_1      TEXT,
  address_line_2      TEXT,
  city                TEXT,
  district            TEXT,
  postal_code         TEXT,
  country             TEXT DEFAULT 'Sri Lanka',
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  company             TEXT,
  job_title           TEXT,
  special_notes       TEXT,
  -- Ticket Tier snapshot
  tier_name           ticket_tier_name NOT NULL,
  tier_label          TEXT NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price          NUMERIC(10,2) NOT NULL,
  total_amount        NUMERIC(10,2) NOT NULL,
  currency            TEXT DEFAULT 'LKR',
  -- Payment info
  payment_method      payment_method NOT NULL DEFAULT 'bank_transfer',
  payment_status      payment_status DEFAULT 'pending',
  payment_slip_path   TEXT,
  payment_slip_url    TEXT,
  paid_at             TIMESTAMPTZ,
  gateway_payment_id  TEXT,
  gateway_status_code TEXT,
  -- Overall booking status
  status              booking_status DEFAULT 'pending',
  admin_notes         TEXT,
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ,
  -- System metadata
  ip_address          TEXT,
  user_agent          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- TICKETS TABLE
CREATE TABLE tickets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id   UUID REFERENCES customers(id),
  ticket_number TEXT NOT NULL UNIQUE DEFAULT generate_ticket_number(),
  qr_token      TEXT NOT NULL,
  qr_expires_at TIMESTAMPTZ NOT NULL,
  status        ticket_status DEFAULT 'issued',
  used_at       TIMESTAMPTZ,
  pdf_url       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ATTENDANCE LOGS TABLE
CREATE TABLE attendance_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id     UUID NOT NULL REFERENCES tickets(id),
  booking_id    UUID NOT NULL REFERENCES bookings(id),
  event_id      UUID NOT NULL REFERENCES events(id),
  customer_id   UUID REFERENCES customers(id),
  scanned_at    TIMESTAMPTZ DEFAULT NOW(),
  gate          TEXT DEFAULT 'Main Gate',
  scanner_name  TEXT DEFAULT 'Staff Scanner',
  ip_address    TEXT,
  user_agent    TEXT,
  result        TEXT DEFAULT 'success'
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id),
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT DEFAULT 'info',
  read          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL LOGS TABLE
CREATE TABLE email_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID REFERENCES bookings(id),
  recipient     TEXT NOT NULL,
  template_type TEXT NOT NULL,
  subject       TEXT NOT NULL,
  resend_id     TEXT,
  status        TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  actor         TEXT DEFAULT 'system',
  changes       JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INDEXES
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_ticket_tiers_event_id ON ticket_tiers(event_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_booking ON tickets(booking_id);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_attendance_logs_ticket ON attendance_logs(ticket_id);
CREATE INDEX idx_attendance_logs_event ON attendance_logs(event_id);

-- 7. TRIGGERS
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs      ENABLE ROW LEVEL SECURITY;

-- Permissive policies for full CRUD operation on events & ticket_tiers
CREATE POLICY "events_all" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ticket_tiers_all" ON ticket_tiers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bookings_all" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tickets_all" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "customers_all" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "attendance_logs_all" ON attendance_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "email_logs_all" ON email_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
