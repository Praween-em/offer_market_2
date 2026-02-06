-- Migration: 2026 DPDP Compliance - Consent Audit Logs
-- This migration adds consent audit logging as required by DPDP Rule 6 (2025)

-- Create consent_audit_logs table
CREATE TABLE consent_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose_id VARCHAR(64) NOT NULL, -- 'LEAD_FULFILLMENT', 'PROFILE_VIEW', etc.
  consent_artefact_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for proof
  event_type VARCHAR(32) NOT NULL, -- 'CONTACT_REVEAL', 'DATA_ACCESS', etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 year' -- DPDP Rule 6: 1-year retention
);

-- Indexes for performance
CREATE INDEX idx_consent_worker ON consent_audit_logs(worker_id);
CREATE INDEX idx_consent_user ON consent_audit_logs(user_id);
CREATE INDEX idx_consent_expires ON consent_audit_logs(expires_at);
CREATE INDEX idx_consent_created ON consent_audit_logs(created_at DESC);

-- Auto-cleanup function for expired logs
CREATE OR REPLACE FUNCTION cleanup_expired_consent_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM consent_audit_logs WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension or external scheduler)
-- This is a placeholder - actual scheduling should be done via cron job or scheduler
COMMENT ON FUNCTION cleanup_expired_consent_logs() IS 'Run daily to clean up expired consent logs';

-- Update service_leads table for Rule of 3
ALTER TABLE service_leads 
  ADD COLUMN unlock_count INT DEFAULT 0,
  ADD COLUMN ad_completion_token VARCHAR(128),
  ADD COLUMN last_unlock_at TIMESTAMPTZ;

-- Add constraint to enforce Rule of 3
ALTER TABLE service_leads 
  ADD CONSTRAINT check_unlock_count CHECK (unlock_count >= 0 AND unlock_count <= 3);

-- Index for unlock tracking
CREATE INDEX idx_service_leads_unlock ON service_leads(unlock_count, status);

COMMENT ON TABLE consent_audit_logs IS '2026 DPDP Compliance: Consent artefact logs with 1-year retention';
COMMENT ON COLUMN service_leads.unlock_count IS 'Rule of 3: Maximum 3 unlocks per lead';
