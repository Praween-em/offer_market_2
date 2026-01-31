
-- 1. Insert Root Categories
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home Maintenance', 'tools', 'Expert fixes for your home and appliances'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Cleaning & Hygiene', 'sparkles', 'Professional cleaning for a healthier home'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Personal Care', 'face-woman', 'Salon and wellness services at your doorstep'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Professional Experts', 'briefcase', 'Consultants for your legal and financial needs');

-- 2. Insert Sub-Categories (linked to roots)
INSERT INTO "service_categories" ("id", "name", "parent_id", "icon", "description") VALUES
-- Home Maintenance subs
(gen_random_uuid(), 'Electricians', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'flash', 'Wiring, switchboards, and appliance installation'),
(gen_random_uuid(), 'Plumbers', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'water-pump', 'Leaking pipes, taps, and bathroom fittings'),
(gen_random_uuid(), 'Carpenters', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hammer', 'Furniture repair and assembly'),
(gen_random_uuid(), 'AC Service & Repair', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'air-conditioner', 'Gas refill, cleaning and repairs'),
-- Cleaning subs
(gen_random_uuid(), 'Full Home Cleaning', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'home-search', 'Deep cleaning and sanitization'),
(gen_random_uuid(), 'Pest Control', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'bug-stop', 'Treatment for cockroaches, termites, etc.'),
-- Personal Care subs
(gen_random_uuid(), 'Salon for Women', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'bottle-tonic-plus', 'Facials, waxing, and hair styling'),
(gen_random_uuid(), 'Men''s Grooming', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'content-cut', 'Haircut, beard trim, and massage'),
-- Professional subs
(gen_random_uuid(), 'CA & Tax Filing', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'calculator', 'Income tax, GST, and accounting');

-- 3. Create Users for Providers
INSERT INTO "users" ("id", "phone", "display_name", "role", "profile_picture") VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', '9000012341', 'Rajesh Sharma', 'service_provider', 'https://ui-avatars.com/api/?name=Rajesh+Sharma&background=random'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', '9000012342', 'Pristine Services', 'service_provider', 'https://ui-avatars.com/api/?name=Pristine+Services&background=random'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', '9000012343', 'Amina Khan', 'service_provider', 'https://ui-avatars.com/api/?name=Amina+Khan&background=random');

-- 4. Create Service Providers
INSERT INTO "service_providers" ("id", "user_id", "category_id", "display_name", "experience_years", "starting_price", "service_area", "bio", "is_verified", "whatsapp_number")
SELECT 
    gen_random_uuid(), 
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 
    id, 
    'Rajesh Electricals', 
    15, 199.00, 'Malviya Nagar, Delhi', 
    'Certified A-grade electrician with 15 years of experience in residential and commercial wiring.', 
    true, '9000012341'
FROM "service_categories" WHERE name = 'Electricians' LIMIT 1;

INSERT INTO "service_providers" ("id", "user_id", "category_id", "display_name", "experience_years", "starting_price", "service_area", "bio", "is_verified", "whatsapp_number")
SELECT 
    gen_random_uuid(), 
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 
    id, 
    'Pristine Cleaners', 
    6, 2499.00, 'HSR Layout, Bangalore', 
    'Eco-friendly deep cleaning experts using imported chemicals and high-tech equipment.', 
    true, '9000012342'
FROM "service_categories" WHERE name = 'Full Home Cleaning' LIMIT 1;

INSERT INTO "service_providers" ("id", "user_id", "category_id", "display_name", "experience_years", "starting_price", "service_area", "bio", "is_verified", "whatsapp_number")
SELECT 
    gen_random_uuid(), 
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 
    id, 
    'Amina Bridal Studio', 
    8, 999.00, 'Andheri West, Mumbai', 
    'Bridal specialist providing premium salon services at your home.', 
    true, '9000012343'
FROM "service_categories" WHERE name = 'Salon for Women' LIMIT 1;

-- 5. Add some individual services for these providers
INSERT INTO "services" ("provider_id", "title", "price", "price_unit")
SELECT id, 'Switchboard Repair', 199.00, 'visit' FROM "service_providers" WHERE display_name = 'Rajesh Electricals';
INSERT INTO "services" ("provider_id", "title", "price", "price_unit")
SELECT id, 'Full House Wiring', 5000.00, 'project' FROM "service_providers" WHERE display_name = 'Rajesh Electricals';
INSERT INTO "services" ("provider_id", "title", "price", "price_unit")
SELECT id, '3BHK Deep Cleaning', 4999.00, 'service' FROM "service_providers" WHERE display_name = 'Pristine Cleaners';

-- 6. Add Portfolio Images
INSERT INTO "service_portfolios" ("provider_id", "image_url", "caption", "display_order")
SELECT id, 'https://placehold.co/600x400?text=Wiring+Project', 'Electrical Wiring at Office', 0 FROM "service_providers" WHERE display_name = 'Rajesh Electricals';
INSERT INTO "service_portfolios" ("provider_id", "image_url", "caption", "display_order")
SELECT id, 'https://placehold.co/600x400?text=Deep+Cleaned+Kitchen', 'Kitchen Restoration', 0 FROM "service_providers" WHERE display_name = 'Pristine Cleaners';
