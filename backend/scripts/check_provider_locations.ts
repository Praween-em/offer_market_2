import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const providers = await prisma.service_providers.findMany({
        select: {
            id: true,
            display_name: true,
            latitude: true,
            longitude: true,
            service_area: true,
        }
    });

    console.log(`Total providers: ${providers.length}`);
    console.log('Providers with NULL coordinates:');
    const nullCoords = providers.filter(p => p.latitude === null || p.longitude === null);
    nullCoords.forEach(p => {
        console.log(`- ${p.display_name} (ID: ${p.id}) Area: ${p.service_area}`);
    });

    console.log('\nProviders WITH coordinates:');
    const withCoords = providers.filter(p => p.latitude !== null && p.longitude !== null);
    withCoords.forEach(p => {
        console.log(`- ${p.display_name} (ID: ${p.id}) Lat: ${p.latitude}, Lng: ${p.longitude} Area: ${p.service_area}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
