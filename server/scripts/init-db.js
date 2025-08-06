import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from '../config/database.js';
import { hashPassword } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error('❌ Error executing statement:', error.message);
          }
        }
      }
    }

    // Create admin user with hashed password
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@minihousekeeper.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await hashPassword(adminPassword);

    await query(
      `INSERT INTO admins (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET 
       password_hash = EXCLUDED.password_hash`,
      [adminEmail, hashedPassword, 'Admin User', 'admin']
    );

    console.log('✅ Database initialized successfully!');
    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log('🔐 You can now login with the admin credentials');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
