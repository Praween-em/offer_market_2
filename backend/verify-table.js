/**
 * Verify service_images table exists
 */

const { Client } = require('pg');

async function verifyTable() {
    require('dotenv').config();

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'service_images'
            );
        `);

        if (tableCheck.rows[0].exists) {
            console.log('✅ service_images table EXISTS');

            // Get table structure
            const structure = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'service_images'
                ORDER BY ordinal_position;
            `);

            console.log('\n📋 Table structure:');
            structure.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
            });

            // Check indexes
            const indexes = await client.query(`
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE tablename = 'service_images';
            `);

            console.log('\n🔍 Indexes:');
            indexes.rows.forEach(row => {
                console.log(`  ${row.indexname}`);
            });

        } else {
            console.log('❌ service_images table DOES NOT EXIST');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

verifyTable();
