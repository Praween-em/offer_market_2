-- ============================================================
-- combined_aws_migration.sql
-- Run this script on your AWS RDS PostgreSQL instance to sync
-- the database with all latest features.
-- Generated: 2026-02-18
-- ============================================================

-- ============================================================
-- SECTION 0: ENUMS (safe to re-run, skips if already exists)
-- ============================================================

DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'banned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('consumer', 'business_owner', 'admin', 'service_provider');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE brand_type_enum AS ENUM ('local', 'chain', 'franchise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE business_type_enum AS ENUM ('electronics', 'clothing', 'grocery', 'footwear', 'restaurant', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('new_offer', 'offer_expiring', 'offer_approved', 'offer_rejected', 'generic', 'NEW_REQUEST', 'LEAD_UNLOCKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Patch: Add missing enum values to existing databases (safe to run multiple times)
DO $$ BEGIN
    ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'NEW_REQUEST';
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'LEAD_UNLOCKED';
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE offer_status_enum AS ENUM ('draft', 'pending', 'active', 'paused', 'expired', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status_enum AS ENUM ('new', 'contacted', 'converted', 'filled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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

-- ============================================================
-- SECTION 1: BASE TABLE COLUMN ADDITIONS
-- ============================================================

-- users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role role_enum DEFAULT 'consumer',
  ADD COLUMN IF NOT EXISTS status user_status_enum DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS profile_picture TEXT,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum DEFAULT 'NOT_STARTED',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email VARCHAR(320);

-- service_providers table
ALTER TABLE service_providers
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS starting_price DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS service_area VARCHAR(255),
  ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_picture TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT,
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);

-- Ensure unique constraint on service_providers.user_id
DO $$ BEGIN
    ALTER TABLE service_providers ADD CONSTRAINT service_providers_user_id_key UNIQUE (user_id);
EXCEPTION WHEN duplicate_object OR duplicate_table OR undefined_object THEN null; END $$;

-- service_categories table
ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS provider_type VARCHAR(32),
  ADD COLUMN IF NOT EXISTS keywords TEXT;

-- service_requests table
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS unlock_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);

-- service_leads table
ALTER TABLE service_leads
  ADD COLUMN IF NOT EXISTS unlock_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_unlock_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ad_completion_token VARCHAR(255);

-- ============================================================
-- SECTION 2: LOCATION INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_providers_location ON service_providers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_requests_location ON service_requests(latitude, longitude);

-- ============================================================
-- SECTION 3: last_viewed_at (Activity Tracking)
-- ============================================================

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ(6);

-- Set initial value for existing rows
UPDATE service_requests
SET last_viewed_at = created_at
WHERE last_viewed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_service_requests_last_viewed ON service_requests(last_viewed_at);

-- ============================================================
-- SECTION 4: budget & urgency (Service Request Enhancements)
-- ============================================================

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'medium';

CREATE INDEX IF NOT EXISTS idx_service_requests_urgency ON service_requests(urgency);

-- Add check constraint for urgency values (safe to skip if exists)
DO $$ BEGIN
    ALTER TABLE service_requests
      ADD CONSTRAINT chk_urgency_values
      CHECK (urgency IN ('low', 'medium', 'high', 'urgent'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- SECTION 5: service_images Table
-- ============================================================

CREATE TABLE IF NOT EXISTS service_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_service_images_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_service_images_service_id ON service_images(service_id);

-- ============================================================
-- SECTION 6: Push Notifications - user_device_tokens
-- ============================================================

CREATE TABLE IF NOT EXISTS user_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(16) DEFAULT 'android',
    created_at TIMESTAMPTZ DEFAULT now(),
    app_type VARCHAR(20) DEFAULT 'USER'
);

CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user ON user_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_app_type ON user_device_tokens(app_type);

-- If table already exists, add app_type column safely
ALTER TABLE user_device_tokens ADD COLUMN IF NOT EXISTS app_type VARCHAR(20) DEFAULT 'USER';

-- ============================================================
-- SECTION 7: notifications - app_type column
-- ============================================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS app_type VARCHAR(20) DEFAULT 'USER';

-- ============================================================
-- SECTION 8: provider_unlocks Table
-- ============================================================

CREATE TABLE IF NOT EXISTS provider_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    ad_completion_token TEXT,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, provider_id)
);

-- ============================================================
-- SECTION 9: lead_unlocks Table
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_unlocks (
    unlock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES service_requests(id),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id),
    ad_completion_token TEXT,
    revealed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lead_id, worker_id)
);

-- Fix worker_id FK if it incorrectly points to user_verification
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.key_column_usage
        WHERE table_name = 'lead_unlocks' AND column_name = 'worker_id' AND constraint_name LIKE '%fkey%'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage
            WHERE table_name = 'user_verification'
            AND constraint_name IN (
                SELECT constraint_name FROM information_schema.key_column_usage
                WHERE table_name = 'lead_unlocks' AND column_name = 'worker_id'
            )
        ) THEN
            ALTER TABLE lead_unlocks DROP CONSTRAINT IF EXISTS lead_unlocks_worker_id_fkey;
            ALTER TABLE lead_unlocks ADD CONSTRAINT lead_unlocks_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================================
-- SECTION 10: DPDP Compliance Tables
-- ============================================================

-- Consent Notices
CREATE TABLE IF NOT EXISTS consent_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    version VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(type, version)
);

-- Consent Ledger
CREATE TABLE IF NOT EXISTS consent_ledger (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose_code VARCHAR(50) NOT NULL,
    notice_id UUID NOT NULL REFERENCES consent_notices(id),
    consent_given_at TIMESTAMPTZ DEFAULT now(),
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_consent_ledger_user ON consent_ledger(user_id);

-- User Verification
CREATE TABLE IF NOT EXISTS user_verification (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name_xml VARCHAR(255),
    masked_aadhaar VARCHAR(14),
    uid_token VARCHAR(255) UNIQUE,
    photo_base64 TEXT,
    verified_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Identity Vault
CREATE TABLE IF NOT EXISTS identity_vault (
    vault_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_verification(user_id) ON DELETE CASCADE,
    encrypted_xml_data TEXT NOT NULL,
    encryption_key_id VARCHAR(100) NOT NULL,
    stored_at TIMESTAMPTZ DEFAULT now()
);

-- User Nominees
CREATE TABLE IF NOT EXISTS user_nominees (
    nominee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_verification(user_id) ON DELETE CASCADE,
    nominee_name VARCHAR(255) NOT NULL,
    nominee_contact VARCHAR(15) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grievance Redressal
CREATE TABLE IF NOT EXISTS grievance_redressal (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_type grievance_issue_type NOT NULL,
    status grievance_status NOT NULL DEFAULT 'OPEN',
    resolution_details TEXT,
    deadline_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Breach Incidents
CREATE TABLE IF NOT EXISTS breach_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT now(),
    affected_users UUID[] NOT NULL,
    affected_count INT NOT NULL,
    breach_details JSONB NOT NULL,
    reported_to_dpb BOOLEAN DEFAULT false,
    status VARCHAR(32) DEFAULT 'DETECTED'
);

-- Forensic Audit Logs
CREATE TABLE IF NOT EXISTS forensic_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON forensic_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON forensic_audit_logs(actor_id);

-- ============================================================
-- SECTION 11: Reporting Tables
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_business_reports_bus ON business_reports(business_id);

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

CREATE INDEX IF NOT EXISTS idx_provider_reports_prov ON service_provider_reports(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_reports_reported_by ON service_provider_reports(reported_by);

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

CREATE INDEX IF NOT EXISTS idx_request_reports_req ON service_request_reports(request_id);
CREATE INDEX IF NOT EXISTS idx_request_reports_reported_by ON service_request_reports(reported_by);

-- ============================================================
-- SECTION 12: Ticketing System
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_tickets_provider ON provider_tickets(provider_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON provider_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON provider_tickets(created_at);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES provider_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES provider_tickets(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- ============================================================
-- SECTION 13: Analytics Events
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(32) NOT NULL,
    source VARCHAR(32) NOT NULL,
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_provider ON analytics_events(provider_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- ============================================================
-- SECTION 14: Seed Data (Required for App Functionality)
-- ============================================================

INSERT INTO consent_notices (type, version, content) VALUES
('ONBOARDING', '1.0', 'By joining Ofera, you agree to our terms of service and DPDP 2026 data guidelines. We collect your location and profile data for service matching purposes.'),
('LEAD_REVEAL', '1.0', 'Confirming this lead will reveal the customer contact details. Your access is logged for compliance audit trail (DPDP Section 8).'),
('OKYC_VERIFY', '1.0', 'I hereby give my consent for E-KYC verification via Aadhaar. My data will be stored securely in the local Aadhaar vault.')
ON CONFLICT (type, version) DO NOTHING;

-- ============================================================
-- SECTION 15: Final Index Cleanup & Housekeeping
-- ============================================================

-- Additional indexes from schema
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user ON service_requests(user_id);

COMMENT ON TABLE consent_ledger IS '2026 DPDP Compliance: Consent artefact logs';
COMMENT ON COLUMN service_leads.unlock_count IS 'Rule of 3: Maximum 3 unlocks per lead';
COMMENT ON COLUMN user_device_tokens.app_type IS 'USER or PROVIDER - determines which app receives push notifications';
COMMENT ON COLUMN notifications.app_type IS 'USER or PROVIDER - routes notification to correct app';
