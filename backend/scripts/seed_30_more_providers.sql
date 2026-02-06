-- ===================================================================
-- 30 ADDITIONAL SERVICE PROVIDERS SEED SCRIPT
-- Adding diverse providers across multiple categories
-- ===================================================================

BEGIN;

-- 1. Create 30 Dummy Users
INSERT INTO "users" (id, phone, display_name, role, status, is_phone_verified) VALUES
('00000000-0000-0000-0000-00000000e001', '+919000001001', 'Rahul Bike Repair', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e002', '+919000001002', 'Sneha Home Tutor', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e003', '+919000001003', 'Pooja Pet Grooming', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e004', '+919000001004', 'Vikram Photo Studio', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e005', '+919000001005', 'Chef Arun K.', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e006', '+919000001006', 'Karan Car Detailing', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e007', '+919000001007', 'Music with Meera', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e008', '+919000001008', 'Dinesh Plumber', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e009', '+919000001009', 'Sonia Bridal makeup', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e010', '+919000001010', 'Rahul Dance Acad.', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e011', '+919000001011', 'Expert AC Fixers', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e012', '+919000001012', 'Happy Paws Walking', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e013', '+919000001013', 'Design by Diya', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e014', '+919000001014', 'Tax Aid Experts', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e015', '+919000001015', 'Pure Water Solutions', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e016', '+919000001016', 'Smart Home Electric', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e017', '+919000001017', 'Deep Clean Squad', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e018', '+919000001018', 'Grooming Hub Men', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e019', '+919000001019', 'Safe Drive School', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e020', '+919000001020', 'Healthy Tiffins', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e021', '+919000001021', 'Aman Painting Co.', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e022', '+919000001022', 'Bark & Bath Spa', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e023', '+919000001023', 'Skillify Coaching', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e024', '+919000001024', 'Party Decorators', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e025', '+919000001025', 'IT Fix Fast', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e026', '+919000001026', 'CareGivers India', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e027', '+919000001027', 'Zen Yoga Trainer', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e028', '+919000001028', 'Fitness with Ravi', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e029', '+919000001029', 'Statutory Auditor', 'service_provider', 'active', true),
('00000000-0000-0000-0000-00000000e030', '+919000001030', 'Pro Pest Killers', 'service_provider', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Service Providers with Dynamic Category IDs
-- Bike Mechanic
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000e001', id, 'Rahul Multi-Brand Bike Service', 7, 250, true, 4.2 FROM "service_categories" WHERE name = 'Bike Mechanic' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Home Tutor
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e002', '00000000-0000-0000-0000-00000000e002', id, 'Sneha Home Tutions (Math/Sci)', 4, 500, true, 4.8 FROM "service_categories" WHERE name = 'Home Tutor' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Pet Groomer
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e003', '00000000-0000-0000-0000-00000000e003', id, 'Pooja - Professional Pet Groomer', 3, 600, true, 4.5 FROM "service_categories" WHERE name = 'Pet Groomer' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Photographer
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e004', '00000000-0000-0000-0000-00000000e004', id, 'Vikram Photography & Cinematography', 10, 2000, true, 4.9 FROM "service_categories" WHERE name = 'Freelance Photographer' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Home Chef
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e005', '00000000-0000-0000-0000-00000000e005', id, 'Chef Arun - North Indian Specialist', 15, 1000, true, 4.7 FROM "service_categories" WHERE name = 'Home Chef' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Car Wash
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e006', '00000000-0000-0000-0000-00000000e006', id, 'Karan Car Wash & Detailing', 5, 499, true, 4.3 FROM "service_categories" WHERE name = 'Car Wash' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Music Teacher
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e007', '00000000-0000-0000-0000-00000000e007', id, 'Music Lessons by Meera (Vocal/Guitar)', 6, 800, true, 4.6 FROM "service_categories" WHERE name = 'Music Teacher' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Plumbers
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e008', '00000000-0000-0000-0000-00000000e008', id, 'Dinesh Plumbing Solutions', 12, 199, true, 4.4 FROM "service_categories" WHERE name IN ('Plumbers', 'Plumbing') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Makeup
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e009', '00000000-0000-0000-0000-00000000e009', id, 'Sonia - Bridal & Party Makeup', 8, 1500, true, 4.8 FROM "service_categories" WHERE name = 'Makeup Artist' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Dance
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e010', '00000000-0000-0000-0000-00000000e010', id, 'Rahul Dance & Fitness Academy', 5, 400, true, 4.5 FROM "service_categories" WHERE name = 'Dance Instructor' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- AC
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e011', '00000000-0000-0000-0000-00000000e011', id, 'Expert AC Service Team', 9, 399, true, 4.1 FROM "service_categories" WHERE name IN ('AC Service & Repair', 'AC Repair') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Pet Walker
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e012', '00000000-0000-0000-0000-00000000e012', id, 'Happy Paws Dog Walking', 2, 200, true, 4.7 FROM "service_categories" WHERE name = 'Pet Walker' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Designer
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e013', '00000000-0000-0000-0000-00000000e013', id, 'Creative Designs by Diya', 6, 1200, true, 4.9 FROM "service_categories" WHERE name = 'Freelance Designer' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- CA
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e014', '00000000-0000-0000-0000-00000000e014', id, 'Tax Aid GST Solutions', 11, 2000, true, 4.6 FROM "service_categories" WHERE name IN ('CA & Tax Filing', 'CA Services') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- RO (Appliance Repair)
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e015', '00000000-0000-0000-0000-00000000e015', id, 'Pure Water RO Maintenance', 7, 300, true, 4.4 FROM "service_categories" WHERE name = 'Appliance Repair' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Electrician
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e016', '00000000-0000-0000-0000-00000000e016', id, 'Smart Home Electricals', 8, 150, true, 4.5 FROM "service_categories" WHERE name IN ('Electricians', 'Electrical') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Cleaning
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e017', '00000000-0000-0000-0000-00000000e017', id, 'Deep Clean Squad Pro', 4, 1100, true, 4.2 FROM "service_categories" WHERE name IN ('Full Home Cleaning', 'Regular Home Cleaning') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Men's grooming
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e018', '00000000-0000-0000-0000-00000000e018', id, 'The Grooming Hub for Men', 5, 299, true, 4.6 FROM "service_categories" WHERE name = 'Men''s Grooming' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Driving School
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e019', '00000000-0000-0000-0000-00000000e019', id, 'Safe Drive - Professional Driving school', 15, 2500, true, 4.8 FROM "service_categories" WHERE name = 'Driving School' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Tiffin
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e020', '00000000-0000-0000-0000-00000000e020', id, 'Healthy Tiffins & Home Meals', 3, 150, true, 4.4 FROM "service_categories" WHERE name = 'Tiffin Service' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Painting
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e021', '00000000-0000-0000-0000-00000000e021', id, 'Aman Professional Painting', 9, 3000, true, 4.5 FROM "service_categories" WHERE name = 'Painting' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Pet Boarding
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e022', '00000000-0000-0000-0000-00000000e022', id, 'Bark & Bath Pet Boarding', 6, 800, true, 4.7 FROM "service_categories" WHERE name = 'Pet Boarding' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Coaching
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e023', '00000000-0000-0000-0000-00000000e023', id, 'Skillify Exam Coaching', 4, 1000, true, 4.6 FROM "service_categories" WHERE name = 'Coaching Center' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Decor
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e024', '00000000-0000-0000-0000-00000000e024', id, 'Elite Party Decorators', 8, 4999, true, 4.9 FROM "service_categories" WHERE name = 'Event Decor' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- IT Support
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e025', '00000000-0000-0000-0000-00000000e025', id, 'IT Fix Fast - Computer Support', 7, 500, true, 4.3 FROM "service_categories" WHERE name IN ('IT Support', 'Computer Repair') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Elderly Care
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e026', '00000000-0000-0000-0000-00000000e026', id, 'CareGivers - Elderly Care Support', 5, 2000, true, 4.8 FROM "service_categories" WHERE name = 'Elderly Care' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Yoga
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e027', '00000000-0000-0000-0000-00000000e027', id, 'Zen Yoga Trainer At Home', 10, 800, true, 4.9 FROM "service_categories" WHERE name = 'Yoga Instructor' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Trainer
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e028', '00000000-0000-0000-0000-00000000e028', id, 'Fitness with Ravi - Home Training', 8, 1200, true, 4.7 FROM "service_categories" WHERE name = 'Personal Trainer' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Legal/CA
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e029', '00000000-0000-0000-0000-00000000e029', id, 'Authorized Statutory Auditor', 12, 5000, true, 4.8 FROM "service_categories" WHERE name IN ('Legal Consultation', 'CA & Tax Filing') LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- Pest
INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_active, average_rating)
SELECT 'e0000000-0000-0000-0000-00000000e030', '00000000-0000-0000-0000-00000000e030', id, 'Pro Pest Killers - Termite Specialists', 10, 1500, true, 4.5 FROM "service_categories" WHERE name = 'Pest Control' LIMIT 1 ON CONFLICT (id) DO NOTHING;

-- 3. Add a Primary Service for Each Provider
INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e001', id, category_id, 'Bike Chain Lubrication & Tightening', 250, 'bike' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e001' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e002', id, category_id, 'One-on-One Math Session (High School)', 500, 'hour' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e002' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e003', id, category_id, 'Full Pet Bath & Blow Dry', 899, 'pet' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e003' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e004', id, category_id, 'Outdoor Portrait Photoshoot (30 min)', 2499, 'session' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e004' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e005', id, category_id, 'Special Dinner Menu Preparation', 2500, 'service' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e005' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e006', id, category_id, 'Premium Car Interior Vacuuming', 599, 'car' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e006' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e007', id, category_id, 'Acoustic Guitar Introductory Lesson', 750, 'hour' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e007' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e008', id, category_id, 'Kitchen Sink Clog Removal', 299, 'sink' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e008' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e009', id, category_id, 'Party Glam Makeup (Full Face)', 1999, 'person' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e009' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e010', id, category_id, 'Bollywood Dance Private Session', 450, 'hour' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e010' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e011', id, category_id, 'Standard AC Filter Cleaning', 399, 'unit' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e011' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e012', id, category_id, 'Active Dog Walk (45 minutes)', 250, 'walk' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e012' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e013', id, category_id, 'Logo Design - Starter Package', 3500, 'logo' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e013' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e014', id, category_id, 'Monthly GST Filing Service', 2499, 'month' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e014' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e015', id, category_id, 'RO Sediment Filter Replacement', 450, 'filter' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e015' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e016', id, category_id, 'Doorbell/Small Appliance Wiring', 199, 'appliance' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e016' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e017', id, category_id, '1BHK Basic Floor Scrubbing', 1499, 'flat' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e017' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e018', id, category_id, 'Premium Men''s Haircut & Styling', 349, 'person' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e018' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e019', id, category_id, 'Beginner Driving Course (10 Days)', 5500, 'course' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e019' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e020', id, category_id, 'Monthly Veg Tiffin Subscription', 3500, 'month' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e020' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e021', id, category_id, 'Single Accent Wall Painting', 1999, 'wall' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e021' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e022', id, category_id, 'Overnight Pet Boarding (Standard)', 800, 'night' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e022' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e023', id, category_id, 'Competitive Exam Foundation Class', 1500, 'session' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e023' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e024', id, category_id, 'Birthday Theme Backdrop Setup', 4999, 'event' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e024' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e025', id, category_id, 'Laptop Ram/SSD Upgrade labor', 499, 'unit' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e025' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e026', id, category_id, 'Daily Elderly Companion Visit (2hr)', 1199, 'day' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e026' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e027', id, category_id, 'Power Yoga Weight Loss Session', 999, 'hour' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e027' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e028', id, category_id, 'Full Body Assessment & Planning', 1499, 'session' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e028' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e029', id, category_id, 'Property Agreement Notarization', 1999, 'document' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e029' ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, price, price_unit)
SELECT 'f0000000-0000-0000-0000-00000000e030', id, category_id, 'Standard Cockroach Gel Treatment', 1199, 'service' FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-00000000e030' ON CONFLICT (id) DO NOTHING;

COMMIT;
