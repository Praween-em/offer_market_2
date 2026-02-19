/**
 * Script to run the service_images table migration
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    // Read DATABASE_URL from .env
    require('dotenv').config();

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected to database');

        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', 'create_service_images_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('\n📝 Executing migration: create_service_images_table.sql');
        console.log('SQL:', sql);

        await client.query(sql);

        console.log('\n✅ Migration completed successfully!');
        console.log('The service_images table has been created.');

        // Verify the table was created
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_images'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Table structure:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed');
    }
}

runMigration()
    .then(() => {
        console.log('\n✅ All done! You can now restart the backend server.');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
