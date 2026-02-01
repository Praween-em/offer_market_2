# Backend Deployment Instructions for AWS

## 1. Database Migration (Run in pgAdmin 4)

Execute the SQL script in `migration_verification_status.sql`:

```sql
-- Create the verification_status enum
CREATE TYPE "verification_status_enum" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- Add verification fields to users table
ALTER TABLE "users" 
ADD COLUMN "verification_status" "verification_status_enum" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "verified_at" TIMESTAMPTZ(6);
```

## 2. Code Deployment

The code has been pushed to: `https://github.com/Praween-em/backend_offera`

Pull the latest changes on your AWS server:
```bash
cd /path/to/backend
git pull origin main
npm install
npm run build
pm2 restart backend  # or your process manager command
```

## 3. UIDAI Public Key Setup

1. Download the UIDAI certificate:
   ```bash
   wget https://uidai.gov.in/images/uidai_offline_publickey_26022019.cer -O uidai_cert.cer
   ```

2. Convert to PEM format:
   ```bash
   openssl x509 -inform DER -in uidai_cert.cer -out uidai_public_key.pem
   ```

3. Update `src/verification/aadhaar.service.ts` with the PEM content from the file.

## 4. Environment Variables

Ensure these are set in your AWS environment:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret
- `BUNNY_*` - Bunny CDN credentials (for file uploads)

## 5. Verify Deployment

Test the new endpoints:
- `POST /profile/verify-aadhaar` - Aadhaar verification (Requires `aadhaar` file and `selfie` file)
- `GET /services/my-profile` - Service provider profile
- `POST /services/manage` - Create service
- `PATCH /services/manage/:id` - Update service
- `DELETE /services/manage/:id` - Delete service

## New Features Deployed

✅ Aadhaar Secure QR Code offline verification
✅ Service provider CRUD with ownership checks
✅ User verification status tracking
✅ Multer file upload for Aadhaar images
