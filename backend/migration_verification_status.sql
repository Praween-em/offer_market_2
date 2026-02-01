-- Migration: Add Verification Status to Users
-- Run this in pgAdmin 4 on your AWS PostgreSQL database

-- Step 1: Create the verification_status enum
CREATE TYPE "verification_status_enum" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- Step 2: Add verification fields to users table
ALTER TABLE "users" 
ADD COLUMN "verification_status" "verification_status_enum" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "verified_at" TIMESTAMPTZ(6);

-- Step 3: Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verification_status', 'verified_at');
