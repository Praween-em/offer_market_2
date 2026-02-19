/**
 * Run budget and urgency migration
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    require('dotenv').config();

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const migrationPath = path.join(__dirname, 'migrations', 'add_budget_urgency_to_requests.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('\n📝 Executing migration: add_budget_urgency_to_requests.sql');
        await client.query(sql);

        console.log('✅ Migration completed successfully!');

        // Verify the columns were added
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_requests' 
            AND column_name IN ('budget', 'urgency');
        `);

        console.log('\n✅ Columns added:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

runMigration()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
