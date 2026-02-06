
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying seeded data...');

    const targetCategories = [
        'Electricians', 'Electrical',
        'Full Home Cleaning', 'Deep Cleaning',
        'Salon for Women',
        'CA & Tax Filing', 'CA Services',
        'Plumbers', 'Plumbing',
        'Massage Therapy', 'Spa at Home'
    ];

    const providers = await prisma.service_providers.findMany({
        where: {
            users: {
                phone: {
                    startsWith: '+9180000000'
                }
            }
        },
        include: {
            service_categories: true,
            services: true,
            users: true
        }
    });

    console.log(`Found ${providers.length} providers.`);

    providers.forEach(p => {
        console.log(`- Provider: ${p.display_name} (Category: ${p.service_categories.name})`);
        console.log(`  Services: ${p.services.map(s => s.title).join(', ')}`);
    });

    if (providers.length === 6) {
        console.log('✅ Verification successful! 6 providers seeded as expected.');
    } else {
        console.log('❌ Verification failed. Expected 6 providers.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
