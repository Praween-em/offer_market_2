-- ===================================================================
-- Expansion of Service Categories: Heavy Machinery & Fashion
-- ===================================================================

BEGIN;

-- 1. Insert New Parent Category for Fashion (if not exists)
INSERT INTO "service_categories" ("id", "name", "icon", "description") 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Fashion & Tailoring', 'tshirt-crew', 'Tailoring, embroidery, and boutique services')
ON CONFLICT (id) DO NOTHING;

-- 2. Heavy Machine Rentals (Under Rentals & Subscriptions: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'JCB & Excavators', 'crane', 'Earthmoving and excavation services', 'business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Road Roller Rental', 'truck-check', 'Road construction machinery', 'business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Concrete Mixers', 'dump-truck', 'Cement and concrete mixing machinery', 'business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Crane Services', 'crane', 'Heavy lifting and crane rentals', 'business');

-- 3. Fashion & Lifestyle Services (Under Fashion & Tailoring: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type") VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Knitting Services', 'fountain-pen-tip', 'Hand and machine knitting for woolens', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Embroidery & Zari', 'format-paint', 'Traditional Indian embroidery and zari work', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Custom Tailoring', 'needle', 'Bespoke tailoring for men and women', 'individual'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Boutique Design', 'star-face', 'Custom fashion design and bridal wear', 'business');

COMMIT;
