
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dummy service requests...');

    // 1. Get some categories
    const categories = await prisma.service_categories.findMany({
        take: 5
    });

    if (categories.length === 0) {
        console.log('No categories found. Please seed categories first.');
        return;
    }

    // 2. Get some users (as requestors)
    const users = await prisma.users.findMany({
        take: 3
    });

    if (users.length === 0) {
        console.log('No users found. Please create users first.');
        return;
    }

    const dummyRequests = [
        {
            title: 'Leaky Kitchen Tap',
            description: 'The tap in my kitchen is leaking constantly. Need someone to fix it ASAP.',
            category_id: categories[0].id,
            user_id: users[0].id,
        },
        {
            title: 'AC Service Needed',
            description: 'My split AC is not cooling properly. Needs cleaning and gas refill.',
            category_id: categories[1 % categories.length].id,
            user_id: users[1 % users.length].id,
        },
        {
            title: 'Electrical Short Circuit',
            description: 'One of the rooms has a short circuit. All appliances are off.',
            category_id: categories[2 % categories.length].id,
            user_id: users[2 % users.length].id,
        },
        {
            title: 'Full House Cleaning',
            description: 'Need deep cleaning for a 3BHK apartment before moving in next week.',
            category_id: categories[3 % categories.length].id,
            user_id: users[0].id,
        },
        {
            title: 'Wall Painting',
            description: 'Need to paint two rooms in my house. Color is already decided.',
            category_id: categories[4 % categories.length].id,
            user_id: users[1 % users.length].id,
        }
    ];

    for (const req of dummyRequests) {
        await prisma.service_requests.create({
            data: {
                title: req.title,
                description: req.description,
                category_id: req.category_id,
                user_id: req.user_id,
                status: 'pending'
            }
        });
    }

    console.log('Successfully seeded 5 dummy service requests.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
