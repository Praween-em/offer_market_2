
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
    try {
        console.log('--- Checking for Service Tables ---');

        // Check service_categories
        try {
            const catCount = await prisma.service_categories.count();
            console.log(`✅ service_categories exists. Count: ${catCount}`);

            // Check for parent_id column
            const firstCat = await prisma.service_categories.findFirst();
            if (firstCat && 'parent_id' in firstCat) {
                console.log('✅ parent_id column exists in service_categories');
            } else if (firstCat) {
                console.log('❌ parent_id column MISSING in service_categories');
            }
        } catch (e) {
            console.log('❌ service_categories table DOES NOT EXIST or query failed');
        }

        // Check service_providers
        try {
            const providerCount = await prisma.service_providers.count();
            console.log(`✅ service_providers exists. Count: ${providerCount}`);
        } catch (e) {
            console.log('❌ service_providers table DOES NOT EXIST or query failed');
        }

        // Check users
        try {
            const userCount = await prisma.users.count();
            console.log(`✅ users table exists. Count: ${userCount}`);
        } catch (e) {
            console.log('❌ users table DOES NOT EXIST or query failed');
        }

    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
