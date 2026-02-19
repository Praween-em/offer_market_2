-- Migration: Add last_viewed_at to service_requests
-- Date: 2026-02-16
-- Description: Track when users last viewed their service requests to calculate new activity

ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ(6);

-- Set initial value to created_at for existing requests
UPDATE service_requests 
SET last_viewed_at = created_at 
WHERE last_viewed_at IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_requests_last_viewed 
ON service_requests(last_viewed_at);
