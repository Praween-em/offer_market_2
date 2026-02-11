-- ===================================================================
-- ADD NEW SERVICE CATEGORIES
-- Requested by user: Editors, Wedding Photographers/Videographers, 
-- JCB, Road Roller, Towing, Daily Labours
-- ===================================================================

BEGIN;

-- 1. Insert Root Category for Construction & Machinery if it doesn't exist
INSERT INTO "service_categories" ("id", "name", "icon", "description", "parent_id")
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Construction & Machinery', 'crane', 'Heavy machinery and construction services', NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Subcategories
-- Note: Using gen_random_uuid() for subcategories to ensure uniqueness while maintaining hierarchy

-- Professional Services (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type", "keywords")
VALUES 
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Video & Photo Editors', 'video-vintage', 'Professional editing for videos and photos', 'individual', 'editing, video editor, photo editor, post-production')
ON CONFLICT DO NOTHING;

-- Events & Entertainment (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type", "keywords")
VALUES 
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Wedding Photographers & Videographers', 'camera-iris', 'Complete wedding photography and videography packages', 'business', 'wedding, photography, videography, marriage, photos, video')
ON CONFLICT DO NOTHING;

-- Construction & Machinery (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type", "keywords")
VALUES 
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'JCB Services', 'excavator', 'Excavation and earthmoving services using JCB', 'business', 'jcb, excavation, digging, earthmoving'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Road Roller Services', 'roller-truck', 'Road compaction and leveling services', 'business', 'road roller, compaction, road work, leveling')
ON CONFLICT DO NOTHING;

-- Vehicle Services (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type", "keywords")
VALUES 
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Towing Services', 'tow-truck', '24/7 vehicle towing and breakdown recovery', 'business', 'towing, breakdown, recovery, car transport')
ON CONFLICT DO NOTHING;

-- Home & Maintenance (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
INSERT INTO "service_categories" ("id", "parent_id", "name", "icon", "description", "provider_type", "keywords")
VALUES 
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Daily Labours', 'account-hard-hat', 'Manual labor for various household and construction tasks', 'individual', 'labour, worker, daily wage, helper, manual labour')
ON CONFLICT DO NOTHING;

COMMIT;
