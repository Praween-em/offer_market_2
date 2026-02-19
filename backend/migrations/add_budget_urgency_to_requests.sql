-- Migration: Add budget and urgency to service_requests
-- Date: 2026-02-17
-- Description: Add budget and urgency fields to help users specify their requirements

ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'medium';

-- Create index for urgency filtering
CREATE INDEX IF NOT EXISTS idx_service_requests_urgency 
ON service_requests(urgency);

-- Add check constraint for urgency values
ALTER TABLE service_requests
ADD CONSTRAINT chk_urgency_values 
CHECK (urgency IN ('low', 'medium', 'high', 'urgent'));
