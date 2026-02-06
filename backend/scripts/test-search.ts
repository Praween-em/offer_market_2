
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testSearch(query: string) {
    console.log(`\nTesting search for: "${query}"`);

    const rawTokens = query.split(/\s+/).filter(t => t.length > 0);
    const tokenFilters: any[] = rawTokens.map(token => {
        const variants = [token];
        if (token.toLowerCase().endsWith('s') && token.length > 3) {
            variants.push(token.slice(0, -1));
        } else if (token.length > 3) {
            variants.push(token + 's');
        }

        return {
            OR: variants.flatMap(v => [
                { display_name: { contains: v, mode: 'insensitive' } },
                { keywords: { contains: v, mode: 'insensitive' } },
                { service_area: { contains: v, mode: 'insensitive' } },
                {
                    service_categories: {
                        OR: [
                            { name: { contains: v, mode: 'insensitive' } },
                            { keywords: { contains: v, mode: 'insensitive' } }
                        ]
                    }
                },
                {
                    services: {
                        some: {
                            OR: [
                                { title: { contains: v, mode: 'insensitive' } },
                                { description: { contains: v, mode: 'insensitive' } }
                            ],
                            is_active: true
                        }
                    }
                }
            ])
        };
    });


    const results = await (prisma.service_providers.findMany as any)({
        where: {
            AND: [
                { is_active: true },
                ...tokenFilters
            ]
        },
        include: {
            service_categories: true,
            services: true
        }
    });

    console.log(`Found ${results.length} results:`);
    results.forEach((p: any) => {
        console.log(`- ${p.display_name} (${p.service_categories?.name || 'No Category'}) [Keywords: ${p.keywords || 'none'}]`);
        p.services?.forEach((s: any) => {
            if (rawTokens.some(t => s.title.toLowerCase().includes(t.toLowerCase()))) {
                console.log(`  * Matched service: ${s.title}`);
            }
        });
    });

}


async function main() {
    try {
        await testSearch('ac repair');
        await testSearch('mechanic');
        await testSearch('salon');
        await testSearch('salons');
    } catch (e) {

        console.error('Search test failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
