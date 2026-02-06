-- Add location fields to service_providers table
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);

-- Add index for geospatial queries on service_providers
CREATE INDEX IF NOT EXISTS idx_service_providers_location ON service_providers(latitude, longitude);

-- Add location fields to service_requests table
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);

-- Add index for geospatial queries on service_requests
CREATE INDEX IF NOT EXISTS idx_service_requests_location ON service_requests(latitude, longitude);
