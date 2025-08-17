import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverDir = join(__dirname, '..', '..');
dotenv.config({ path: join(serverDir, '.env') });

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mini_housekeeper',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function runServicesMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running services table migration...');
    
    // Read the migration SQL file
    const migrationPath = join(__dirname, 'add-services-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Services table migration completed successfully!');
    console.log('📋 Default services have been inserted.');
    
    // Verify the migration by checking if services exist
    const result = await client.query('SELECT COUNT(*) as count FROM services');
    console.log(`📊 Total services in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runServicesMigration()
  .then(() => {
    console.log('🎉 Migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  });
