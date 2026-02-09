-- reporting_and_grievance_migration.sql
-- Run this on your database to set up the reporting and grievance support systems.

-- ==========================================
-- 1. Enums
-- ==========================================

DO $$ BEGIN
    CREATE TYPE report_reason_enum AS ENUM ('fake', 'misleading', 'expired', 'inaccurate', 'spam', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'action_taken');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE grievance_issue_type AS ENUM ('ERASURE', 'CORRECTION', 'BREACH_REPORT', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE grievance_status AS ENUM ('OPEN', 'RESOLVED', 'ESCALATED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_category_enum AS ENUM ('payment_dispute', 'account_issue', 'platform_bug', 'policy_question', 'lead_quality', 'verification_issue', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('open', 'in_progress', 'waiting_provider', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 2. Reporting Tables
-- ==========================================

-- Business Reports
CREATE TABLE IF NOT EXISTS business_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason report_reason_enum NOT NULL,
  notes TEXT,
  status report_status_enum DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- Service Provider Reports
CREATE TABLE IF NOT EXISTS service_provider_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason report_reason_enum NOT NULL,
  notes TEXT,
  status report_status_enum DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service Request Reports
CREATE TABLE IF NOT EXISTS service_request_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason report_reason_enum NOT NULL,
  notes TEXT,
  status report_status_enum DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for Reporting
CREATE INDEX IF NOT EXISTS idx_business_reports_bus ON business_reports(business_id);
CREATE INDEX IF NOT EXISTS idx_provider_reports_prov ON service_provider_reports(provider_id);
CREATE INDEX IF NOT EXISTS idx_request_reports_req ON service_request_reports(request_id);

-- ==========================================
-- 3. Grievance & Ticket System
-- ==========================================

-- Simple Grievance Redressal (Direct Reports)
CREATE TABLE IF NOT EXISTS grievance_redressal (
  ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_type grievance_issue_type NOT NULL,
  status grievance_status NOT NULL DEFAULT 'OPEN',
  resolution_details TEXT,
  deadline_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-message Ticketing System
CREATE TABLE IF NOT EXISTS provider_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  category ticket_category_enum NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ticket_priority_enum DEFAULT 'medium',
  status ticket_status_enum DEFAULT 'open',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES provider_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES provider_tickets(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_provider ON provider_tickets(provider_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
