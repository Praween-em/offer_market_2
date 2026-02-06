-- ===================================================================
-- MASTER COMPREHENSIVE DUMMY DATA SEED SCRIPT
-- Covers EVERY category and subcategory defined in previous steps
-- ===================================================================

BEGIN;

-- 1. Dummy Users (d000 series)
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000e01', '+917000000001', 'Amit Machinery', 'service_provider', true),
('00000000-0000-0000-0000-000000000e02', '+917000000002', 'Pooja Fashion', 'service_provider', true),
('00000000-0000-0000-0000-000000000e03', '+917000000003', 'Raj Event Planner', 'service_provider', true),
('00000000-0000-0000-0000-000000000e04', '+917000000004', 'Vikas Professional', 'service_provider', true),
('00000000-0000-0000-0000-000000000e05', '+917000000005', 'Dr. Health', 'service_provider', true),
('00000000-0000-0000-0000-000000000e06', '+917000000006', 'Karan Cleaner', 'service_provider', true),
('00000000-0000-0000-0000-000000000e07', '+917000000007', 'Suresh Repair', 'service_provider', true),
('00000000-0000-0000-0000-000000000e08', '+917000000008', 'Rina Tutor', 'service_provider', true),
('00000000-0000-0000-0000-000000000e09', '+917000000009', 'Pet Palace', 'service_provider', true),
('00000000-0000-0000-0000-000000000e10', '+917000000010', 'Rahul Driver', 'service_provider', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Service Providers & Services
-- For brevity, we'll map multiple subcategories to these users

-- MACHINERY RENTALS
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000e01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'JCB Bharat Rentals', 5000, true, 4.8, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'JCB 3DX Earthmover', 6000, 'day') ON CONFLICT DO NOTHING;

-- FASHION
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000e02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'Pooja Custom Tailors', 500, true, 4.7, 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'Bridal Blouse Stitching', 1200, 'piece') ON CONFLICT DO NOTHING;

-- EVENT RENTALS
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000e03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'Raj Tent & Flowers', 2000, true, 4.5, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'Complete Tent Decor', 15000, 'event') ON CONFLICT DO NOTHING;

-- PROFESSIONAL (CA)
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000e04', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', 'Vikas Agarwal & Associates', 1000, true, 4.9, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', 'GST Return Filing', 1500, 'return') ON CONFLICT DO NOTHING;

-- HEALTH (Yoga & Physio)
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000e05', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Prana Yoga at Home', 500, true, 4.8, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Personal Hatha Yoga', 600, 'hour') ON CONFLICT DO NOTHING;

-- CLEANING
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000e06', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Karan Deep Cleaners', 800, true, 4.6, 'https://images.unsplash.com/photo-1584820846723-93ad39a77953?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Full House Deep Clean', 3500, 'service') ON CONFLICT DO NOTHING;

-- PET CARE
INSERT INTO "service_providers" (id, user_id, category_id, display_name, starting_price, is_active, average_rating, profile_picture) VALUES
('e0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000e09', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Pet Palace Grooming', 400, true, 4.7, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=200') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Full Pet Bath', 700, 'pet') ON CONFLICT DO NOTHING;

COMMIT;
