
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const cats = await prisma.service_categories.findMany({
        select: { id: true, name: true }
    });
    for (const c of cats) {
        console.log(`${c.name}|${c.id}`);
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
