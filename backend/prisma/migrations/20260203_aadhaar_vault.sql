-- Migration: 2026 DPDP Compliance - Aadhaar Data Vault v14
-- This migration implements secure Aadhaar storage as per UIDAI guidelines

-- Create aadhaar_vault table (isolated, encrypted storage)
CREATE TABLE aadhaar_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  uid_token VARCHAR(128) NOT NULL UNIQUE, -- Reference key, NOT actual Aadhaar
  masked_aadhaar VARCHAR(16), -- XXXX-XXXX-1234 format only
  ekyc_xml_encrypted BYTEA, -- Encrypted e-KYC XML data
  encryption_key_id VARCHAR(64), -- HSM key reference
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vault_user ON aadhaar_vault(user_id);
CREATE INDEX idx_vault_token ON aadhaar_vault(uid_token);

-- HSM Access Logs for audit trail
CREATE TABLE aadhaar_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES aadhaar_vault(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES users(id),
  access_type VARCHAR(32) NOT NULL, -- 'READ', 'VERIFY', 'UPDATE'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for access logs
CREATE INDEX idx_access_vault ON aadhaar_access_logs(vault_id);
CREATE INDEX idx_access_user ON aadhaar_access_logs(accessed_by);
CREATE INDEX idx_access_time ON aadhaar_access_logs(created_at DESC);

-- Update service_providers table
ALTER TABLE service_providers
  ADD COLUMN uid_token VARCHAR(128) UNIQUE,
  ADD COLUMN masked_aadhaar VARCHAR(16),
  ADD COLUMN aadhaar_verified_at TIMESTAMPTZ;

-- Create index for verification status
CREATE INDEX idx_providers_aadhaar_verified ON service_providers(aadhaar_verified_at) WHERE aadhaar_verified_at IS NOT NULL;

-- Security: Ensure no plain Aadhaar storage
-- If there's an existing aadhaar_number column, it should be dropped
-- ALTER TABLE service_providers DROP COLUMN IF EXISTS aadhaar_number;

COMMENT ON TABLE aadhaar_vault IS 'Secure vault for Aadhaar e-KYC data with HSM encryption';
COMMENT ON COLUMN aadhaar_vault.uid_token IS 'Reference token - NEVER store actual Aadhaar number';
COMMENT ON COLUMN aadhaar_vault.ekyc_xml_encrypted IS 'Encrypted e-KYC XML from UIDAI';
COMMENT ON TABLE aadhaar_access_logs IS 'HSM-grade access logs for compliance';
