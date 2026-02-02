import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding mock reviews...');

    // 1. Get a service provider
    const provider = await prisma.service_providers.findFirst();
    if (!provider) {
        console.log('No service provider found. Please run initial seeds first.');
        return;
    }

    // 2. Get some users to act as reviewers
    const users = await prisma.users.findMany({
        take: 3,
        where: { id: { not: provider.user_id } }
    });

    if (users.length === 0) {
        console.log('No reviewer users found.');
        return;
    }

    const mockReviews = [
        { rating: 5, comment: "Excellent service! Very professional and on time." },
        { rating: 4, comment: "Good quality work, would recommend." },
        { rating: 5, comment: "Fantastic job, very polite and efficient." }
    ];

    for (let i = 0; i < Math.min(users.length, mockReviews.length); i++) {
        await prisma.service_reviews.create({
            data: {
                provider_id: provider.id,
                user_id: users[i].id,
                rating: mockReviews[i].rating,
                comment: mockReviews[i].comment
            }
        });
    }

    // 3. Update provider stats
    const stats = await prisma.service_reviews.aggregate({
        where: { provider_id: provider.id },
        _avg: { rating: true },
        _count: { id: true }
    });

    await prisma.service_providers.update({
        where: { id: provider.id },
        data: {
            average_rating: stats._avg.rating || 0,
            total_reviews: stats._count.id || 0
        }
    });

    console.log(`Successfully seeded ${Math.min(users.length, mockReviews.length)} mock reviews for provider: ${provider.display_name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
