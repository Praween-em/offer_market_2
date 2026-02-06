-- ===================================================================
-- FILTERED DUMMY DATA SEED SCRIPT
-- For Testing Specific Categories: 
-- Electricians, Full Home Cleaning, Salon for Women, CA & Tax Filing, Plumbers, Massage Therapy
-- ===================================================================

BEGIN;

-- 1. Create Dummy Users
INSERT INTO "users" (id, phone, display_name, role, status, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000f01', '+918000000001', 'Amit Electric', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000f02', '+918000000002', 'Neeta Cleaning', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000f03', '+918000000003', 'Priya Salon', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000f04', '+918000000004', 'Alok Tax Solutions', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000f05', '+918000000005', 'Suresh Plumber', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000f06', '+918000000006', 'Zen Massage', 'service_provider', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Service Providers
-- We use subqueries to find the correct category IDs to be script-agnostic

-- Electricians
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 
    'e0000000-0000-0000-0000-000000000f01', 
    '00000000-0000-0000-0000-000000000f01', 
    id, 
    'Amit Electric Works', 
    8, 200, true, 4.5
FROM "service_categories" 
WHERE name IN ('Electricians', 'Electrical') 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Full Home Cleaning
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 
    'e0000000-0000-0000-0000-000000000f02', 
    '00000000-0000-0000-0000-000000000f02', 
    id, 
    'Neeta Deep Cleaners', 
    5, 1500, true, 4.7
FROM "service_categories" 
WHERE name IN ('Full Home Cleaning', 'Deep Cleaning') 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Salon for Women
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 
    'e0000000-0000-0000-0000-000000000f03', 
    '00000000-0000-0000-0000-000000000f03', 
    id, 
    'Priya Beauty Studio', 
    10, 500, true, 4.8
FROM "service_categories" 
WHERE name IN ('Salon for Women') 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- CA & Tax Filing
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 
    'e0000000-0000-0000-0000-000000000f04', 
    '00000000-0000-0000-0000-000000000f04', 
    id, 
    'Alok & Associates Tax', 
    12, 1000, true, 4.9
FROM "service_categories" 
WHERE name IN ('CA & Tax Filing', 'CA Services') 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Plumbers
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 
    'e0000000-0000-0000-0000-000000000f05', 
    '00000000-0000-0000-0000-000000000f05', 
    id, 
    'Suresh Plumbing Expert', 
    15, 150, true, 4.6
FROM "service_categories" 
WHERE name IN ('Plumbers', 'Plumbing') 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Massage Therapy
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 
    'e0000000-0000-0000-0000-000000000f06', 
    '00000000-0000-0000-0000-000000000f06', 
    id, 
    'Zen Wellness Spa', 
    7, 1200, true, 4.8
FROM "service_categories" 
WHERE name IN ('Massage Therapy', 'Spa at Home') 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 3. Create Specific Services
-- Amit Electric
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-000000000f01', id, category_id, 'Full House Wiring Check', 500, 'visit'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f01'
ON CONFLICT (id) DO NOTHING;

-- Neeta Cleaning
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-000000000f02', id, category_id, 'Standard 2BHK Deep Clean', 2499, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f02'
ON CONFLICT (id) DO NOTHING;

-- Priya Salon
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-000000000f03', id, category_id, 'Bridal Makeup Package', 4999, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f03'
ON CONFLICT (id) DO NOTHING;

-- Alok Tax
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-000000000f04', id, category_id, 'Individual ITR Filing', 999, 'return'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f04'
ON CONFLICT (id) DO NOTHING;

-- Suresh Plumber
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-000000000f05', id, category_id, 'Emergency Leak Repair', 299, 'visit'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f05'
ON CONFLICT (id) DO NOTHING;

-- Zen Massage
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-000000000f06', id, category_id, 'Swedish Massage (90 min)', 1800, 'session'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f06'
ON CONFLICT (id) DO NOTHING;

COMMIT;
