-- consolidated_manual_migration.sql
-- Run this script on your AWS RDS instance to sync the database with latest features.

-- ==========================================
-- 0. Base Enums and Table Fixes
-- ==========================================

-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'banned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('consumer', 'business_owner', 'admin', 'service_provider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE brand_type_enum AS ENUM ('local', 'chain', 'franchise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_type_enum AS ENUM ('electronics', 'clothing', 'grocery', 'footwear', 'restaurant', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('new_offer', 'offer_expiring', 'offer_approved', 'offer_rejected', 'generic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status_enum AS ENUM ('draft', 'pending', 'active', 'paused', 'expired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status_enum AS ENUM ('new', 'contacted', 'converted', 'filled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fix users table (ensure all base columns exist)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role role_enum DEFAULT 'consumer',
  ADD COLUMN IF NOT EXISTS status user_status_enum DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS profile_picture TEXT,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum DEFAULT 'NOT_STARTED',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email VARCHAR(320);

-- Fix service_providers table (exhaustive sync)
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

-- Fix service_requests table (exhaustive sync)
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS unlock_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);

-- Ensure Unique constraint on user_id (Required for Prisma findUnique)
DO $$ BEGIN
    ALTER TABLE service_providers ADD CONSTRAINT service_providers_user_id_key UNIQUE (user_id);
EXCEPTION
    WHEN duplicate_object OR duplicate_table OR undefined_object THEN null;
END $$;

-- ==========================================
-- 1. Location Discovery (Recent Updates)
-- ==========================================

-- Create spatial index for providers
CREATE INDEX IF NOT EXISTS idx_providers_location ON service_providers(latitude, longitude);

-- Add location fields to service_requests
-- (Moved to base table fixes for service_requests)

-- Create spatial index for requests
CREATE INDEX IF NOT EXISTS idx_requests_location ON service_requests(latitude, longitude);

-- Fix service_categories table
ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS provider_type VARCHAR(32),
  ADD COLUMN IF NOT EXISTS keywords TEXT;

-- ==========================================
-- 2. Legal Requirements (DPDP Compliance)
-- ==========================================

-- A. Consent Management
CREATE TABLE IF NOT EXISTS consent_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- ONBOARDING, LEAD_REVEAL, OKYC_VERIFY
  version VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(type, version)
);

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

-- B. User Verification & Identity Vault
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

CREATE TABLE IF NOT EXISTS identity_vault (
  vault_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_verification(user_id) ON DELETE CASCADE,
  encrypted_xml_data TEXT NOT NULL,
  encryption_key_id VARCHAR(100) NOT NULL,
  stored_at TIMESTAMPTZ DEFAULT now()
);

-- C. Rule of 3 & Lead Unlocks
ALTER TABLE service_leads
  ADD COLUMN IF NOT EXISTS unlock_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_unlock_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ad_completion_token VARCHAR(255);

CREATE TABLE IF NOT EXISTS lead_unlocks (
  unlock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES service_requests(id),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  ad_completion_token TEXT,
  revealed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id, worker_id)
);

-- Fix for existing tables: Update worker_id reference if it points to user_verification
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.key_column_usage 
        WHERE table_name = 'lead_unlocks' 
        AND column_name = 'worker_id' 
        AND constraint_name LIKE '%fkey%'
    ) THEN
        -- Check if it points to user_verification
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

-- D. Nominees & Redressal
CREATE TABLE IF NOT EXISTS user_nominees (
  nominee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_verification(user_id) ON DELETE CASCADE,
  nominee_name VARCHAR(255) NOT NULL,
  nominee_contact VARCHAR(15) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE TYPE grievance_issue_type AS ENUM ('ERASURE', 'CORRECTION', 'BREACH_REPORT', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grievance_status AS ENUM ('OPEN', 'RESOLVED', 'ESCALATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS grievance_redressal (
  ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_type grievance_issue_type NOT NULL,
  status grievance_status NOT NULL DEFAULT 'OPEN',
  resolution_details TEXT,
  deadline_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- E. Audit & Breach Reporting
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

CREATE TABLE IF NOT EXISTS forensic_audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON forensic_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON forensic_audit_logs(actor_id);

-- ==========================================
-- 3. Analytics (If Missing)
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(32) NOT NULL, -- call, whatsapp, view
  source VARCHAR(32) NOT NULL,      -- profile, service, request
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- ==========================================
-- 4. Seed Data (Required for App Functionality)
-- ==========================================
INSERT INTO consent_notices (type, version, content) VALUES 
('ONBOARDING', '1.0', 'By joining Ofera, you agree to our terms of service and DPDP 2026 data guidelines. We collect your location and profile data for service matching purposes.'),
('LEAD_REVEAL', '1.0', 'Confirming this lead will reveal the customer contact details. Your access is logged for compliance audit trail (DPDP Section 8).'),
('OKYC_VERIFY', '1.0', 'I hereby give my consent for E-KYC verification via Aadhaar. My data will be stored securely in the local Aadhaar vault.')
ON CONFLICT (type, version) DO NOTHING;

-- ==========================================
-- 5. Housekeeping
-- ==========================================
COMMENT ON TABLE consent_ledger IS '2026 DPDP Compliance: Consent artefact logs';
COMMENT ON COLUMN service_leads.unlock_count IS 'Rule of 3: Maximum 3 unlocks per lead';
