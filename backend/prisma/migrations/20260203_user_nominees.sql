-- Migration: 2026 DPDP Compliance - User Nominees (Section 10)
-- This migration implements the Nomination Right as per DPDP Act Section 10

-- Create user_nominees table
CREATE TABLE user_nominees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nominee_name VARCHAR(255) NOT NULL,
  nominee_phone VARCHAR(20) NOT NULL,
  nominee_email VARCHAR(320),
  relationship VARCHAR(64),
  consent_given BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  consent_text TEXT, -- Store the exact consent text shown to user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_nominee_user ON user_nominees(user_id);
CREATE INDEX idx_nominee_consent ON user_nominees(consent_given) WHERE consent_given = TRUE;

-- Constraint: Consent must be given
ALTER TABLE user_nominees
  ADD CONSTRAINT check_nominee_consent 
  CHECK (consent_given = FALSE OR (consent_given = TRUE AND consent_given_at IS NOT NULL));

COMMENT ON TABLE user_nominees IS 'Section 10 Compliance: Nomination Right for data management in case of incapacity';
COMMENT ON COLUMN user_nominees.consent_given IS 'Explicit consent required as per DPDP Act';
