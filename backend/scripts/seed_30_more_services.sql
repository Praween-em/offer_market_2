-- ===================================================================
-- 30 ADDITIONAL SERVICES SEED SCRIPT
-- Adding diverse services to existing providers
-- ===================================================================

BEGIN;

-- 1. Electrical Services (Amit Electric Works - e0000000-0000-0000-0000-000000000f01)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0001-0000-0000-000000000001', 
    'e0000000-0000-0000-0000-000000000f01', 
    category_id, 
    'Ceiling Fan Installation', 
    'Installation of standard or decorative ceiling fans including mounting and wiring.', 
    350, 'fan'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f01'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0001-0000-0000-000000000002', 
    'e0000000-0000-0000-0000-000000000f01', 
    category_id, 
    'MCB Fuse Replacement', 
    'Safety check and replacement of faulty MCB switches or fuses to prevent short circuits.', 
    150, 'unit'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f01'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0001-0000-0000-000000000003', 
    'e0000000-0000-0000-0000-000000000f01', 
    category_id, 
    'Inverter Repair & Service', 
    'Complete maintenance and repair of home inverters and battery topping.', 
    450, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f01'
ON CONFLICT (id) DO NOTHING;

-- 2. Deep Cleaning (Neeta Deep Cleaners - e0000000-0000-0000-0000-000000000f02)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0002-0000-0000-000000000001', 
    'e0000000-0000-0000-0000-000000000f02', 
    category_id, 
    'Kitchen Deep Cleaning', 
    'Thorough cleaning of tiles, cabinets (internal & external), exhaust fan, and stove.', 
    1299, 'kitchen'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f02'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0002-0000-0000-000000000002', 
    'e0000000-0000-0000-0000-000000000f02', 
    category_id, 
    'Sofa Shampooing (5 Seater)', 
    'Mechanical dry vacuuming followed by wet shampooing and extraction for deep soil removal.', 
    750, 'sofa'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f02'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0002-0000-0000-000000000003', 
    'e0000000-0000-0000-0000-000000000f02', 
    category_id, 
    'Bathroom Deep Cleaning', 
    'Removal of hard water stains from tiles, floors, and chrome fittings using professional chemicals.', 
    499, 'bathroom'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f02'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0002-0000-0000-000000000004', 
    'e0000000-0000-0000-0000-000000000f02', 
    category_id, 
    'Full Terrace Cleaning', 
    'Pressure washing and sweeping of the terrace area to remove dust and moss.', 
    999, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f02'
ON CONFLICT (id) DO NOTHING;

-- 3. Salon for Women (Priya Beauty Studio - e0000000-0000-0000-0000-000000000f03)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0003-0000-0000-000000000001', 
    'e0000000-0000-0000-0000-000000000f03', 
    category_id, 
    'Waxing - Full Body', 
    'Complete body waxing using premium honey or chocolate wax for smooth skin.', 
    899, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f03'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0003-0000-0000-000000000002', 
    'e0000000-0000-0000-0000-000000000f03', 
    category_id, 
    'Fruit Facial', 
    'Cleansing and nourishing facial using natural fruit extracts for a radiant glow.', 
    599, 'face'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f03'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0003-0000-0000-000000000003', 
    'e0000000-0000-0000-0000-000000000f03', 
    category_id, 
    'Pedicure & Manicure Deluxe', 
    'Relaxing hand and foot soak followed by exfoliation, massage, and nail grooming.', 
    699, 'session'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f03'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0003-0000-0000-000000000004', 
    'e0000000-0000-0000-0000-000000000f03', 
    category_id, 
    'Hair Smoothening', 
    'Professional hair smoothening treatment for silkier and more manageable hair.', 
    2499, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f03'
ON CONFLICT (id) DO NOTHING;

-- 4. CA & Tax Filing (Alok & Associates Tax - e0000000-0000-0000-0000-000000000f04)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0004-0000-0000-000000000001', 
    'e0000000-0000-0000-0000-000000000f04', 
    category_id, 
    'GST Registration', 
    'Complete assistance with GST registration for new businesses and startups.', 
    1499, 'registration'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f04'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0004-0000-0000-000000000002', 
    'e0000000-0000-0000-0000-000000000f04', 
    category_id, 
    'Company Audit', 
    'Annual statutory audit for private limited companies as per MCA requirements.', 
    15000, 'audit'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f04'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0004-0000-0000-000000000003', 
    'e0000000-0000-0000-0000-000000000f04', 
    category_id, 
    'Tax Planning & Advisory', 
    'Professional advice on tax-saving investments and wealth management.', 
    2500, 'session'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f04'
ON CONFLICT (id) DO NOTHING;

-- 5. Plumbers (Suresh Plumbing Expert - e0000000-0000-0000-0000-000000000f05)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0005-0000-0000-000000000001', 
    'e0000000-0000-0000-0000-000000000f05', 
    category_id, 
    'Tap/Faucet Replacement', 
    'Removal of old taps and installation of new ones in kitchen or bathroom.', 
    199, 'tap'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f05'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0005-0000-0000-000000000002', 
    'e0000000-0000-0000-0000-000000000f05', 
    category_id, 
    'Water Tank Cleaning', 
    'Professional cleaning of overhead or underground water tanks using scrubbers.', 
    850, 'tank'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f05'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0005-0000-0000-000000000003', 
    'e0000000-0000-0000-0000-000000000f05', 
    category_id, 
    'Washbasin Blockage Removal', 
    'Clearing of choked washbasins or kitchen sinks using specialized tools.', 
    249, 'service'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f05'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0005-0000-0000-000000000004', 
    'e0000000-0000-0000-0000-000000000f05', 
    category_id, 
    'Toilet Flush Repair', 
    'Fixing of flush tanks, valves, and water continuous flow issues.', 
    349, 'visit'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f05'
ON CONFLICT (id) DO NOTHING;

-- 6. Massage Therapy (Zen Wellness Spa - e0000000-0000-0000-0000-000000000f06)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0006-0000-0000-000000000001', 
    'e0000000-0000-0000-0000-000000000f06', 
    category_id, 
    'Deep Tissue Massage', 
    'Therapeutic massage focused on deeper layers of muscle tissue to relieve tension.', 
    2200, 'session'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f06'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0006-0000-0000-000000000002', 
    'e0000000-0000-0000-0000-000000000f06', 
    category_id, 
    'Head & Shoulder Massage (30 min)', 
    'Quick stress-relief session targeting upper body tension.', 
    600, 'session'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f06'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0006-0000-0000-000000000003', 
    'e0000000-0000-0000-0000-000000000f06', 
    category_id, 
    'Aromatherapy Massage', 
    'Relaxing full body massage using essential oils for emotional and physical well-being.', 
    1999, 'session'
FROM "service_providers" WHERE id = 'e0000000-0000-0000-0000-000000000f06'
ON CONFLICT (id) DO NOTHING;

-- 7. AC Repair (AC Solutions - 00000000-0000-0000-0000-000000000b01)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0007-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000b01', 
    category_id, 
    'AC Gas Charging', 
    'Refilling of AC refrigerant gas (R22/R32/R410) and leak check.', 
    2499, 'service'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b01'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0007-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000b01', 
    category_id, 
    'AC PCB Repair', 
    'Diagnostic and repair of the AC indoor or outdoor unit control board.', 
    1800, 'unit'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b01'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0007-0000-0000-000000000003', 
    '00000000-0000-0000-0000-000000000b01', 
    category_id, 
    'Split AC Installation', 
    'Complete installation of split AC including bracket mounting and piping.', 
    1499, 'ac'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b01'
ON CONFLICT (id) DO NOTHING;

-- 8. Carpentry (Carpenter Specialist - 00000000-0000-0000-0000-000000000b10)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0008-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000b10', 
    category_id, 
    'Door Lock Installation', 
    'Professional fitting of cylindrical, mortise, or smart door locks.', 
    399, 'lock'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b10'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0008-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000b10', 
    category_id, 
    'Furniture Assembly', 
    'Assembly of wardrobe, bed, or study table (IKEA/Pepperfry/Urban Ladder).', 
    699, 'item'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b10'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0008-0000-0000-000000000003', 
    '00000000-0000-0000-0000-000000000b10', 
    category_id, 
    'Cabinet Hinge Repair', 
    'Replacement or repair of loose or broken cabinet door hinges.', 
    149, 'hinge'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b10'
ON CONFLICT (id) DO NOTHING;

-- 9. Bike/Car Wash (Car Specialist - 00000000-0000-0000-0000-000000000b09)
INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0009-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000b09', 
    category_id, 
    'Interior Detailing (Hatchback)', 
    'Deep cleaning of seats, roof, floor, and dashboard using premium chemicals.', 
    1499, 'car'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b09'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0009-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000b09', 
    category_id, 
    'Full Body Wax & Polish', 
    'Machine polishing and wax application for a long-lasting exterior shine.', 
    1199, 'car'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b09'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "services" (id, provider_id, category_id, title, description, price, price_unit)
SELECT 
    'f0000000-0009-0000-0000-000000000003', 
    '00000000-0000-0000-0000-000000000b09', 
    category_id, 
    'Headlight Restoration', 
    'Removal of yellowing/oxidation from headlights to improve night visibility.', 
    499, 'pair'
FROM "service_providers" WHERE id = '00000000-0000-0000-0000-000000000b09'
ON CONFLICT (id) DO NOTHING;

COMMIT;
