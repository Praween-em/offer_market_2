
-- 1. Update Schema if needed (for direct SQL execution)
ALTER TABLE "service_categories" ADD COLUMN IF NOT EXISTS "provider_type" VARCHAR(32);

-- 2. Cleanup existing data to avoid conflicts and start fresh
-- We use CASCADE to handle dependencies if any
TRUNCATE TABLE "service_categories" CASCADE;

-- 3. Insert Root Categories (Main Pillars)
INSERT INTO "service_categories" ("id", "name", "icon", "description", "parent_id") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home & Maintenance', 'home', 'Everything to keep your home running smoothly', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Cleaning & Hygiene', 'broom', 'Professional cleaning for a healthier home', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Personal Care', 'face-woman', 'Beauty, grooming and wellness services', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Health & Wellness', 'heart-pulse', 'Medical and wellness services at home', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Vehicle Services', 'car', 'Car/bike repair, cleaning and transport', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Food & Kitchen', 'silverware-fork-knife', 'Meal services, cooking and groceries', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Education & Learning', 'school', 'Tutoring, coaching and skill development', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Care', 'paw', 'Everything for your furry friends', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Events & Entertainment', 'party-popper', 'Event planning and entertainment services', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Professional Services', 'briefcase', 'Legal, financial and business experts', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Rentals & Subscriptions', 'package-variant', 'Rent equipment, furniture and daily needs', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Senior & Special Care', 'human-wheelchair', 'Care and support for elderly and special needs', NULL);

-- 4. Insert Sub-Categories (mapped from user's "Services" SQL)
-- These are categorized under root categories and assigned a provider_type
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES
-- Home & Maintenance (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Plumbing', 'pipe-wrench', 'Pipe leaks, tap repair, drainage issues', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Electrical', 'flash', 'Wiring, switch repair, appliance fixing', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carpentry', 'hammer', 'Furniture repair, door/window fixes', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Appliance Repair', 'washing-machine', 'Fridge, AC, washing machine repair', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Painting', 'format-paint', 'Interior/exterior painting, wall textures', 'individual'),

-- Cleaning (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Regular Home Cleaning', 'broom', 'Daily/weekly cleaning services', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Deep Cleaning', 'water', 'Complete home deep cleaning', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sofa/Carpet Cleaning', 'sofa', 'Professional sofa and carpet cleaning', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Kitchen Cleaning', 'stove', 'Modular kitchen deep cleaning', 'individual'),

-- Personal Care (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Haircut at Home', 'content-cut', 'Professional haircut for men/women', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Makeup Artist', 'brush', 'Bridal, party, daily makeup', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Spa at Home', 'spa', 'Massage, facial, relaxation', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Manicure/Pedicure', 'hand-heart', 'Nail care and grooming', 'individual'),

-- Health & Wellness (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Yoga Instructor', 'yoga', 'Personal yoga sessions at home', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Personal Trainer', 'dumbbell', 'Home workout training', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Dietician', 'food-apple', 'Diet planning and consultation', 'individual'),

-- Vehicle Services (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Car Mechanic', 'wrench', 'On-site car repair and servicing', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Bike Mechanic', 'motorbike', 'Bike repair and maintenance', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Car Wash', 'car-wash', 'Car cleaning and detailing', 'individual'),

-- Food & Kitchen (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Home Chef', 'chef-hat', 'Cook for parties or daily meals', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Part-time Cook', 'food', 'Daily cooking assistance', 'individual'),

-- Education (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Home Tutor', 'teach', 'School/college subject tutoring', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Music Teacher', 'music', 'Instrument or vocal training', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Dance Instructor', 'dance-ballroom', 'Dance lessons at home', 'individual'),

-- Pet Care (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Walker', 'dog', 'Dog walking and exercise', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Groomer', 'dog-side', 'Pet bathing and grooming', 'individual'),

-- Professional Services (Individual)
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Freelance Photographer', 'camera', 'Event and portrait photography', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Freelance Designer', 'palette', 'Graphic or interior design', 'individual'),

-- Business Services (🏢)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pest Control Service', 'spray-bottle', 'Professional pest elimination', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home Renovation', 'home-renovate', 'Complete home makeover', 'business'),

-- Cleaning (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Office Cleaning', 'office-building', 'Commercial space cleaning', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Industrial Cleaning', 'factory', 'Factory and warehouse cleaning', 'business'),

-- Health & Wellness (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Doctor at Home', 'doctor', 'Medical consultation at home', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Nursing Care', 'nurse', 'Professional nursing services', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Physiotherapy', 'arm-flex', 'Rehabilitation therapy', 'business'),

-- Vehicle Services (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Car Rental Service', 'car-rental', 'Self-drive or chauffeur cars', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Driving School', 'steering', 'Professional driving lessons', 'business'),

-- Food & Kitchen (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Tiffin Service', 'food-takeout-box', 'Daily meal subscriptions', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Catering Service', 'food-turkey', 'Event and party catering', 'business'),

-- Education (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Coaching Center', 'school-outline', 'Competitive exam coaching', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Skill Development', 'certificate', 'Professional training courses', 'business'),

-- Pet Care (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Pet Boarding', 'dog-house', 'Pet daycare and boarding', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Veterinary Clinic', 'dog-service', 'Pet health and vaccination', 'business'),

-- Events & Entertainment (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Wedding Planning', 'ring', 'Complete wedding coordination', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Event Decor', 'flower', 'Theme decoration for events', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'DJ Services', 'music-note', 'Music and sound for events', 'business'),

-- Professional Services (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Legal Consultation', 'gavel', 'Property and business law', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'CA Services', 'calculator', 'Tax filing and accounting', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'IT Support', 'desktop-classic', 'Computer and network repair', 'business'),

-- Rentals (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Furniture Rental', 'table-chair', 'Temporary furniture rental', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Appliance Rental', 'fridge', 'Short-term appliance rental', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Costume Rental', 'hanger', 'Wedding and party wear rental', 'business'),

-- Senior Care (Business)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Elderly Care', 'human-handsup', '24/7 elderly assistance', 'business'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Special Needs Care', 'heart-broken', 'Care for special needs individuals', 'business');
