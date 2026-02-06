-- ===================================================================
-- ULTIMATE COMPREHENSIVE DUMMY DATA SEED SCRIPT
-- Coverage: Every Single Sub-category in the system
-- ===================================================================

BEGIN;

-- CLEANUP (Optional: Uncomment if you want to clear previous dummy data)
-- DELETE FROM "services" WHERE id::text LIKE 's0000%';
-- DELETE FROM "service_providers" WHERE id::text LIKE 'd0000%';
-- DELETE FROM "users" WHERE id::text LIKE '00000000-0000-0000-0000-000000000d%';

-- 1. Helper function for inserting dummy data (or just raw inserts for compatibility)
-- We will use a sequence-like approach for IDs to ensure uniqueness.

-- -------------------------------------------------------------------
-- FASHION & LIFESTYLE (Fashion pillar)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d01', '+918000000001', 'Aditi Fashioner', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000d01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'Aditi''s Knitting Studio', 5, 200, true, 4.5, 23, 'https://images.unsplash.com/photo-1584290867415-527a8475726d?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'Hand-Knitted Sweater', 'Custom wool sweaters with various patterns', 1500, 'piece') ON CONFLICT DO NOTHING;

INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d02', '+918000000002', 'Zari Masters', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000d02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Royal Zari Work', 12, 500, true, 4.9, 150, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Gold Thread Embroidery', 'Premium zari work for bridal sarees', 5000, 'saree') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- RENTALS & MACHINERY
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d10', '+918000000010', 'Machinery King', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000d10', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Mega Road Rollers', 20, 4500, true, 4.7, 45, 'https://images.unsplash.com/photo-1579362092823-f3cad436fe65?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000010', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', '10-Ton Roller Rental', 'Heavy duty road roller for construction', 4500, 'day') ON CONFLICT DO NOTHING;

INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d11', '+918000000011', 'Lift Masters', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000d11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Global Crane Services', 15, 8000, true, 4.8, 89, 'https://images.unsplash.com/photo-1579362092823-f3cad436fe65?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Hydraulic Crane Rental', '50-ton mobile crane for industrial use', 12000, 'day') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- EVENTS & RENTALS
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d20', '+918000000020', 'Tent King', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000d20', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'Sunshine Tent House', 10, 5000, true, 4.3, 34, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000020', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'Full Marriage Tent', 'Complete tent setup with flowers and lights', 45000, 'event') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- PROFESSIONAL & CA
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d30', '+918000000030', 'Tax Expert', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000d30', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', 'S.K. Agarwal & Co.', 15, 1000, true, 4.8, 67, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000030', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', 'ITR Filing (Salaried)', 'Income tax return filing for individuals', 1500, 'return') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- HEALTH & WELLNESS (Yoga)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d40', '+918000000040', 'Yoga Guru', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000d40', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Prana Yoga Center', 8, 300, true, 4.9, 42, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000040', 'd0000000-0000-0000-0000-000000000040', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Personal Hatha Yoga', '1-on-1 yoga session at your home', 500, 'hour') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- CLEANING (Industrial)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d50', '+918000000050', 'Industrial Cleaners Corp', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000d50', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Pro-Industrial Cleaners', 20, 10000, true, 4.6, 15, 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000050', 'd0000000-0000-0000-0000-000000000050', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Warehouse Deep Scrubbing', 'Mechanical scrubbing of large floors', 15000, 'project') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- VEHICLE (Car Wash)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d60', '+918000000061', 'Crystal Car Wash', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000d60', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Crystal Shine Detailing', 5, 299, true, 4.4, 88, 'https://images.unsplash.com/photo-1590674899484-13da0d1b5ec2?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000060', 'd0000000-0000-0000-0000-000000000060', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Exterior Foam Wash', 'High pressure foam wash for sedans', 350, 'car') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- PET CARE (Veterinary)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d70', '+918000000070', 'Dr. Animal Love', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000d70', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Happy Paws Clinic', 12, 500, true, 4.9, 120, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000070', 'd0000000-0000-0000-0000-000000000070', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Vaccination Package', 'Annual vaccines for dogs and cats', 1200, 'pet') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- RENTALS (Costume)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d80', '+918000000080', 'The Costume Shop', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000d80', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Fancy Dress Hub', 6, 250, true, 4.5, 30, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
-- -------------------------------------------------------------------
-- APPLIANCES (AC Service)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d90', '+918000000090', 'Cool Tech Solutions', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000090', '00000000-0000-0000-0000-000000000d90', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Cooling Experts', 8, 499, true, 4.2, 56, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000090', 'd0000000-0000-0000-0000-000000000090', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Split AC Servicing', 'Complete cleaning and filter check', 999, 'unit') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- PERSONAL CARE (Salon)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000da0', '+918000000100', 'Glow Salon', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000da0', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Urban Glow Salon', 10, 300, true, 4.7, 142, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000100', 'd0000000-0000-0000-0000-000000000100', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Classic Haircut', 'Modern hair styling for men/women', 400, 'person') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- FOOD & KITCHEN (Tiffin)
-- -------------------------------------------------------------------
INSERT INTO "users" (id, phone, display_name, role, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000db0', '+918000000110', 'Mom''s Kitchen', 'service_provider', true) ON CONFLICT DO NOTHING;
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating, total_reviews, profile_picture) VALUES
('d0000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000db0', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Healthy Tiffin Services', 20, 80, true, 4.8, 250, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&auto=format') ON CONFLICT DO NOTHING;
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('s0000000-0000-0000-0000-000000000110', 'd0000000-0000-0000-0000-000000000110', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Daily Veg Thali', 'Full lunch thali with roti, sabzi, dal', 120, 'meal') ON CONFLICT DO NOTHING;

COMMIT;
