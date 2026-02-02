
-- Insert dummy service request for "Salon for Women"
DO $$ 
DECLARE
    new_request_id uuid := gen_random_uuid();
    category_id uuid := '6f2c1b20-282b-4811-8b61-23eb9c7b72ed'; -- Salon for Women ID
    user_id uuid := 'f2aa58e5-f1a1-4251-abb5-d0fab34759f3';
BEGIN
    INSERT INTO service_requests (
        id,
        user_id,
        category_id,
        title,
        description,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_request_id,
        user_id,
        category_id,
        'Looking for experienced Hair Stylist',
        'I need a haircut and styling service at home. Prefer someone with 5+ years of experience.',
        'pending',
        NOW(),
        NOW()
    );

    INSERT INTO service_request_media (
        id,
        request_id,
        image_url,
        created_at
    ) VALUES (
        gen_random_uuid(),
        new_request_id,
        'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', -- Dummy Salon Image
        NOW()
    );

    RAISE NOTICE 'Service Request Created with ID: %', new_request_id;
END $$;
