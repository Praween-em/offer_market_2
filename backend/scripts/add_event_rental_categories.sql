-- ===================================================================
-- Expansion of Service Categories: Marriage & Event Rentals
-- ===================================================================

BEGIN;

-- Heavy Machine Rentals were added in b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30-33 range

-- Marriage & Event Rentals (Under Rentals & Subscriptions: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Tent House & Decoration', 'home-modern', 'Tents, pandals, and full event decoration services', 'business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Chair & Table Rental', 'table-chair', 'Rental of chairs, tables, and seating arrangements', 'business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Stage & Light Systems', 'lightbulb-outline', 'Stage construction, sound, and lighting for events', 'business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Marriage Item Rentals', 'ring', 'Utensils, bedding, and other items for guest stays', 'business');

COMMIT;
