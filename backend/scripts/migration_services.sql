
-- 1. Update Enums
ALTER TYPE "role_enum" ADD VALUE IF NOT EXISTS 'service_provider';
ALTER TYPE "lead_status_enum" ADD VALUE IF NOT EXISTS 'new';
ALTER TYPE "lead_status_enum" ADD VALUE IF NOT EXISTS 'contacted';
ALTER TYPE "lead_status_enum" ADD VALUE IF NOT EXISTS 'converted';

-- 2. Create service_categories table
CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "parent_id" UUID,
    "icon" VARCHAR(64),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- 3. Add self-relation for hierarchy
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_parent_id_fkey" 
    FOREIGN KEY ("parent_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- 4. Create service_providers table
CREATE TABLE IF NOT EXISTS "service_providers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "starting_price" DECIMAL(12, 2),
    "service_area" VARCHAR(255),
    "whatsapp_number" VARCHAR(20),
    "phone_number" VARCHAR(20),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_providers_user_id_key" ON "service_providers"("user_id");
CREATE INDEX IF NOT EXISTS "idx_service_providers_category" ON "service_providers"("category_id");

-- 5. Create services table
CREATE TABLE IF NOT EXISTS "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12, 2),
    "price_unit" VARCHAR(32) NOT NULL DEFAULT 'service',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- 6. Create service_portfolios table
CREATE TABLE IF NOT EXISTS "service_portfolios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" VARCHAR(255),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_portfolios_pkey" PRIMARY KEY ("id")
);

-- 7. Create service_leads table
CREATE TABLE IF NOT EXISTS "service_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id" UUID NOT NULL,
    "user_id" UUID,
    "user_phone" VARCHAR(20) NOT NULL,
    "user_name" VARCHAR(255),
    "service_requested" VARCHAR(255),
    "status" "lead_status_enum" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "service_leads_pkey" PRIMARY KEY ("id")
);

-- 8. Add Foreign Keys
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_category_id_fkey" 
    FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "services" ADD CONSTRAINT "services_provider_id_fkey" 
    FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "service_portfolios" ADD CONSTRAINT "service_portfolios_provider_id_fkey" 
    FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "service_leads" ADD CONSTRAINT "service_leads_provider_id_fkey" 
    FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "service_leads" ADD CONSTRAINT "service_leads_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
