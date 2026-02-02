
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const sqlPath = path.join(__dirname, 'seed_dummy_req.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split commands if possible, or execute as one block if it's a DO block.
        // Since our SQL is a single DO $$ ... $$ block, it should execute fine as one raw command.

        console.log('Executing SQL seed...');
        await prisma.$executeRawUnsafe(sql);
        console.log('Seed executed successfully');
    } catch (e) {
        console.error('Error executing seed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
