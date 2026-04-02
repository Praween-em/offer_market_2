-- Migration: add_provider_type_to_service_providers
-- Adds provider_type column to service_providers to distinguish individual vs business providers.

ALTER TABLE service_providers
  ADD COLUMN IF NOT EXISTS provider_type VARCHAR(32);
