-- ===================================================================
-- Expansion of Service Categories: Professional Services (CA & Tax)
-- ===================================================================

BEGIN;

-- CA & Tax Filing (Under Professional Services: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'CA & Tax Filing', 'calculator', 'Income tax, GST, and financial consulting services', 'business');

COMMIT;
