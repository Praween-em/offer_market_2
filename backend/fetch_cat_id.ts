
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const cat = await prisma.service_categories.findFirst({
            where: {
                name: {
                    contains: 'Salon for Women',
                    mode: 'insensitive'
                }
            }
        });
        console.log(cat ? cat.id : 'CATEGORY_NOT_FOUND');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
