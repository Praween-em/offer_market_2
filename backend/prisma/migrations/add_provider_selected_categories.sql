-- Migration: add_provider_selected_categories
-- Allows a provider to opt-in to multiple service categories for their feed.

CREATE TABLE IF NOT EXISTS provider_selected_categories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID         NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    category_id UUID         NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (provider_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_psc_provider ON provider_selected_categories(provider_id);
CREATE INDEX IF NOT EXISTS idx_psc_category ON provider_selected_categories(category_id);
