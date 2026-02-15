import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

// Polyfill for BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  try {
    console.log('Starting application...');
    console.log('Environment Check (2026-01-25 17:25):');
    console.log(`- PORT: ${process.env.PORT || 3000}`);
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);

    const app = await NestFactory.create(AppModule);

    // --- Forced Database Sync (Resolving production 500s) ---
    const prisma = app.get(PrismaService);
    console.log('Running forced database schema synchronization...');
    try {
      // Add missing columns
      await prisma.$executeRawUnsafe('ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "website" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "affiliate_url" TEXT;');

      // Create Notification & Unlock Tables
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "user_device_tokens" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "fcm_token" TEXT NOT NULL UNIQUE,
          "platform" VARCHAR(16) NOT NULL DEFAULT 'android',
          "app_type" VARCHAR(20) NOT NULL DEFAULT 'USER',
          "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add app_type column if table exists but column is missing
      await prisma.$executeRawUnsafe('ALTER TABLE "user_device_tokens" ADD COLUMN IF NOT EXISTS "app_type" VARCHAR(20) DEFAULT \'USER\';');

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "provider_unlocks" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "provider_id" UUID NOT NULL REFERENCES "service_providers"("id") ON DELETE CASCADE,
          "ad_completion_token" TEXT,
          "unlocked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Wallet Tables if they don't exist
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "user_wallets" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
          "current_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
          "pending_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
          "total_earned" DECIMAL(12,2) NOT NULL DEFAULT 0,
          "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "cashback_transactions" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "amount" DECIMAL(12,2) NOT NULL,
          "total_profit" DECIMAL(12,2) NOT NULL,
          "network_order_id" TEXT UNIQUE,
          "platform" VARCHAR(64),
          "status" TEXT NOT NULL DEFAULT 'pending',
          "type" TEXT NOT NULL DEFAULT 'cashback',
          "notes" TEXT,
          "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Affiliate Stores Table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "affiliate_stores" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" VARCHAR(128) NOT NULL,
          "slug" VARCHAR(64) NOT NULL UNIQUE,
          "description" TEXT,
          "logo_url" TEXT,
          "icon_name" VARCHAR(64),
          "brand_color" VARCHAR(7),
          "affiliate_url" TEXT NOT NULL,
          "profit_percentage" DOUBLE PRECISION NOT NULL,
          "cashback_percentage" DOUBLE PRECISION NOT NULL,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "display_order" INTEGER NOT NULL DEFAULT 0,
          "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "affiliate_stores_is_active_display_order_idx" 
        ON "affiliate_stores"("is_active", "display_order");
      `);

      console.log('✅ Database schema sync completed.');
    } catch (syncError) {
      console.warn('⚠️ Schema sync warning (non-fatal):', syncError.message);
    }
    // --------------------------------------------------------

    // Validate that the global prefix does not block the health check at '/'
    app.setGlobalPrefix('api', {
      exclude: ['/'],
    });

    app.enableCors();

    // Basic request logger for debugging
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server running on http://0.0.0.0:${port}/api`);
    console.log(`❤️ Health check available at http://0.0.0.0:${port}/`);

  } catch (error) {
    console.error('❌ FATAL ERROR DURING STARTUP:', error);
    process.exit(1);
  }
}
bootstrap();
