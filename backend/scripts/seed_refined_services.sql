
-- 0. Ensure schema is updated
ALTER TABLE "service_categories" ADD COLUMN IF NOT EXISTS "provider_type" VARCHAR(32);

-- 1. Insert New Root Categories (Main Pillars)
-- Skipping existing: Home Maintenance, Cleaning & Hygiene, Personal Care, Professional Experts
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Vehicle Services', 'car', 'Car/bike repair, cleaning and transport');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Food & Kitchen', 'silverware-fork-knife', 'Meal services, cooking and groceries');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Education & Learning', 'school', 'Tutoring, coaching and skill development');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Care', 'paw', 'Everything for your furry friends');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Events & Entertainment', 'party-popper', 'Event planning and entertainment services');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Professional Services', 'briefcase', 'Marketing, IT and business consulting');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Rentals & Subscriptions', 'package-variant', 'Rent equipment, furniture and daily needs');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Senior & Special Care', 'human-wheelchair', 'Care and support for elderly and special needs');
INSERT INTO "service_categories" ("id", "name", "icon", "description") VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Health & Wellness', 'heart-pulse', 'Medical and wellness services at home');

-- 2. Insert New Sub-Categories (Service Types)
-- Home & Maintenance (New Sub-cats)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Appliance Repair', 'washing-machine', 'Fridge, AC, washing machine repair', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Painting', 'format-paint', 'Interior/exterior painting, wall textures', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home Renovation', 'home-renovate', 'Complete home makeover', 'business');

-- Cleaning (New Sub-cats)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Regular Home Cleaning', 'broom', 'Daily/weekly cleaning services', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sofa/Carpet Cleaning', 'sofa', 'Professional sofa and carpet cleaning', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Kitchen Cleaning', 'stove', 'Modular kitchen deep cleaning', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Office Cleaning', 'office-building', 'Commercial space cleaning', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Industrial Cleaning', 'factory', 'Factory and warehouse cleaning', 'business');

-- Personal Care (New Sub-cats)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Haircut at Home', 'content-cut', 'Professional haircut for men/women', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Makeup Artist', 'brush', 'Bridal, party, daily makeup', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Spa at Home', 'spa', 'Massage, facial, relaxation', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Manicure/Pedicure', 'hand-heart', 'Nail care and grooming', 'individual');

-- Health & Wellness (New Cats)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '123e4567-e89b-12d3-a456-426614174000', 'Yoga Instructor', 'yoga', 'Personal yoga sessions at home', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '123e4567-e89b-12d3-a456-426614174000', 'Personal Trainer', 'dumbbell', 'Home workout training', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '123e4567-e89b-12d3-a456-426614174000', 'Dietician', 'food-apple', 'Diet planning and consultation', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '123e4567-e89b-12d3-a456-426614174000', 'Doctor at Home', 'doctor', 'Medical consultation at home', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '123e4567-e89b-12d3-a456-426614174000', 'Nursing Care', 'nurse', 'Professional nursing services', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '123e4567-e89b-12d3-a456-426614174000', 'Physiotherapy', 'arm-flex', 'Rehabilitation therapy', 'business');

-- Vehicle Services
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Car Mechanic', 'wrench', 'On-site car repair and servicing', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Bike Mechanic', 'motorbike', 'Bike repair and maintenance', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Car Wash', 'car-wash', 'Car cleaning and detailing', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Car Rental Service', 'car-rental', 'Self-drive or chauffeur cars', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Driving School', 'steering', 'Professional driving lessons', 'business');

-- Food & Kitchen
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Home Chef', 'chef-hat', 'Cook for parties or daily meals', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Part-time Cook', 'food', 'Daily cooking assistance', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Tiffin Service', 'food-takeout-box', 'Daily meal subscriptions', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Catering Service', 'food-turkey', 'Event and party catering', 'business');

-- Education
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Home Tutor', 'teach', 'School/college subject tutoring', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Music Teacher', 'music', 'Instrument or vocal training', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Dance Instructor', 'dance-ballroom', 'Dance lessons at home', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Coaching Center', 'school-outline', 'Competitive exam coaching', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Skill Development', 'certificate', 'Professional training courses', 'business');

-- Pet Care
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Walker', 'dog', 'Dog walking and exercise', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Groomer', 'dog-side', 'Pet bathing and grooming', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Boarding', 'dog-house', 'Pet daycare and boarding', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Veterinary Clinic', 'dog-service', 'Pet health and vaccination', 'business');

-- Events & Entertainment
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Wedding Planning', 'ring', 'Complete wedding coordination', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Event Decor', 'flower', 'Theme decoration for events', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'DJ Services', 'music-note', 'Music and sound for events', 'business');

-- Professional Services
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Freelance Photographer', 'camera', 'Event and portrait photography', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Freelance Designer', 'palette', 'Graphic or interior design', 'individual');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Legal Consultation', 'gavel', 'Property and business law', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'IT Support', 'desktop-classic', 'Computer and network repair', 'business');

-- Rentals
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Furniture Rental', 'table-chair', 'Temporary furniture rental', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Appliance Rental', 'fridge', 'Short-term appliance rental', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Costume Rental', 'hanger', 'Wedding and party wear rental', 'business');

-- Senior Care
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Elderly Care', 'human-handsup', '24/7 elderly assistance', 'business');
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Special Needs Care', 'heart-broken', 'Care for special needs individuals', 'business');
