
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTables() {
    try {
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
        console.log('--- Public Tables ---');
        console.table(tables);
    } catch (err) {
        console.error('Error listing tables:', err);
    } finally {
        await prisma.$disconnect();
    }
}

listTables();
