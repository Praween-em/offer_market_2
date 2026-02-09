import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Anantapur central coordinates
    const baseLat = 14.6819;
    const baseLng = 77.6006;

    const anantapurProviders = await prisma.service_providers.findMany({
        where: {
            OR: [
                { service_area: { contains: 'Anantapur' } },
                { display_name: { contains: 'Adi' } } // Specific one from logs
            ]
        }
    });

    console.log(`Found ${anantapurProviders.length} providers in Anantapur area.`);

    for (let i = 0; i < anantapurProviders.length; i++) {
        const p = anantapurProviders[i];
        // Add slight offsets so they aren't all on top of each other
        const lat = baseLat + (Math.random() - 0.5) * 0.05;
        const lng = baseLng + (Math.random() - 0.5) * 0.05;

        await prisma.service_providers.update({
            where: { id: p.id },
            data: {
                latitude: lat,
                longitude: lng
            }
        });
        console.log(`Updated ${p.display_name} with Lat: ${lat}, Lng: ${lng}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
