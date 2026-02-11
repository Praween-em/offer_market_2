-- Add app_type column to user_device_tokens table
ALTER TABLE "user_device_tokens" ADD COLUMN "app_type" VARCHAR(20) DEFAULT 'USER';

-- Optional: Create an index for faster filtering
CREATE INDEX "idx_user_device_tokens_app_type" ON "user_device_tokens"("app_type");
