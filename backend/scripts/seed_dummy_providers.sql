-- ===================================================================
-- COMPREHENSIVE DUMMY DATA SEED SCRIPT (REPAIRED)
-- For Testing All Categories and Sub-categories
-- ===================================================================

BEGIN;

-- 1. Create a set of dummy users (Role: service_provider)
-- Format: 00000000-0000-0000-0000-000000000d[XX]

INSERT INTO "users" (id, phone, display_name, role, status, is_phone_verified) VALUES
('00000000-0000-0000-0000-000000000d01', '+919000000001', 'Rahul Sharma', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d02', '+919000000002', 'Anita Desai', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d03', '+919000000003', 'Vikram Singh', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d04', '+919000000004', 'Sita Ram', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d05', '+919000000005', 'Rajesh Kumar', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d06', '+919000000006', 'Priya Mani', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d07', '+919000000007', 'Arun Varma', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d08', '+919000000008', 'Kavita Iyer', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d09', '+919000000009', 'Sanjay Dutt', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d10', '+919000000010', 'Deepak Jolly', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d11', '+919000000011', 'Sunita Rao', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d12', '+919000000012', 'Mohan Das', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d13', '+919000000013', 'Gopal Krishnan', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d14', '+919000000014', 'Meera Bai', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d15', '+919000000015', 'Abdul Kalam', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d16', '+919000000016', 'Jennifer Smith', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d17', '+919000000017', 'Steve Rogers', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d18', '+919000000018', 'Bruce Wayne', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d19', '+919000000019', 'Clark Kent', 'service_provider', 'active', true),
('00000000-0000-0000-0000-000000000d20', '+919000000020', 'Peter Parker', 'service_provider', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Service Provider Profiles
-- Format IDs: e0000000-0000-0000-0000-0000000000[XX]

INSERT INTO "service_providers" (id, user_id, category_id, display_name, experience_years, starting_price, is_verified, average_rating, total_reviews, profile_picture) VALUES
-- Vehicle (Car Mechanic)
('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000d01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Sharma Moto Care', 10, 299, true, 4.8, 156, 'https://images.unsplash.com/photo-1590674899484-13da0d1b5ec2?q=80&w=200'),
-- Cleaning (Sofa)
('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000d02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'Sparkle Cleaners', 5, 499, true, 4.5, 89, 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?q=80&w=200'),
-- Health (Physio)
('e0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000d03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'V-Care Physio', 12, 800, true, 4.9, 210, 'https://images.unsplash.com/photo-1622222941167-a8299f7baad0?q=80&w=200'),
-- Home Main (Painting)
('e0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000d04', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Royal Wall Textures', 8, 1500, false, 4.2, 45, 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?q=80&w=200'),
-- Rentals (JCB)
('e0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000d05', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'EarthMovers Rentals', 15, 5000, true, 4.7, 34, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=200'),
-- Fashion (Embroidery)
('e0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000d06', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Priyas Zari Art', 7, 250, true, 4.6, 67, 'https://images.unsplash.com/photo-1584290867415-527a8475726d?q=80&w=200'),
-- Professional (Legal)
('e0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000d07', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Varma & Associates', 20, 1000, true, 4.9, 120, 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?q=80&w=200'),
-- Education (Home Tutor)
('e0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000d08', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Kavita Math Tuitions', 4, 300, false, 4.4, 30, 'https://images.unsplash.com/photo-1491013516836-7dbf43697534?q=80&w=200'),
-- Events (Tent)
('e0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000d09', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'Sanjay Tent & Decor', 11, 10000, true, 4.7, 56, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=200'),
-- Senior Care (Elderly)
('e0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000d10', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'Golden Years Support', 6, 500, true, 4.8, 42, 'https://images.unsplash.com/photo-1581579186913-43ac396edf95?q=80&w=200'),
-- Personal Care (Salon)
('e0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000d11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Sunita Salon at Home', 9, 200, true, 4.7, 134, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=200'),
-- Appliance (AC Repair)
('e0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000d12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Das Cooling Works', 15, 350, true, 4.5, 200, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?q=80&w=200'),
-- Pet Care (Groom)
('e0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000d13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Happy Tails Grooming', 5, 600, true, 4.8, 45, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=200'),
-- Food (Home Chef)
('e0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000d14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Meera Home Kitchen', 20, 150, true, 4.9, 312, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200'),
-- Prof (IT Support)
('e0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000d15', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Kalam PC Care', 12, 500, true, 4.6, 78, 'https://images.unsplash.com/photo-1588702547919-26089e690eca?q=80&w=200'),
-- Tailoring
('e0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000d16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'Jennifer Boutiques', 10, 500, true, 4.7, 95, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200'),
-- Appliance Rent
('e0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000d17', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Rent-A-Cool', 4, 1500, false, 4.2, 12, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200'),
-- DJ
('e0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000d18', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Wayne Beats & sound', 8, 5000, true, 4.9, 150, 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?q=80&w=200'),
-- Design
('e0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000d19', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'Kent Creative Studios', 6, 2000, true, 4.7, 54, 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=200'),
-- Renovation
('e0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000d20', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Spider Home Makeover', 5, 50000, true, 4.8, 20, 'https://images.unsplash.com/photo-1503387762-592eda58efad?q=80&w=200')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Specific Services
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Complete Engine Tune-up', 'Checkup and tuning', 1500, 'service'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '5-Seater Sofa Deep Clean', 'Wet shampooing', 999, 'service'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'Back Pain Treatment', 'Expert physiotherapy', 800, 'session'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Accent Wall Painting', 'Metallic texture', 3500, 'wall'),
('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000011', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Party Makeup + Hair', 'Full look', 2500, 'service'),
('f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000012', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'AC Gas Refill', 'Expert service', 2500, 'unit')
ON CONFLICT (id) DO NOTHING;

COMMIT;
