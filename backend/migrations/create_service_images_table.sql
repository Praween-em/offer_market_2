-- Migration: Create service_images table
-- Date: 2026-02-16
-- Description: Add service_images table to store multiple images per service

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_images_service_id ON service_images(service_id);

-- Grant permissions
GRANT ALL ON service_images TO postgres;
GRANT ALL ON service_images TO PUBLIC;
