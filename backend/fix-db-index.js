
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Adding unique index to provider_unlocks table...');
    try {
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "provider_unlocks_user_id_provider_id_key" 
      ON "provider_unlocks"("user_id", "provider_id");
    `);
        console.log('✅ Unique index "provider_unlocks_user_id_provider_id_key" created successfully.');
    } catch (e) {
        console.error('❌ Failed to create index:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
