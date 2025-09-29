#!/usr/bin/env tsx

/**
 * Add Foreign Key Constraints
 * 
 * This script adds foreign key constraints that reference the users table
 * once it's created by NileDB.
 */

import { getNileClient } from '../lib/niledb/client';

async function addForeignKeyConstraints(): Promise<void> {
  console.log('🔗 Adding Foreign Key Constraints\n');
  console.log('=================================\n');
  
  const nile = getNileClient();
  
  try {
    // Check if users table exists
    const usersExists = await nile.db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
        AND table_schema = 'public'
      ) as exists;
    `);
    
    console.log(`Users table exists: ${usersExists.rows[0].exists}`);
    
    if (usersExists.rows[0].exists) {
      console.log('\n✅ Users table found - adding foreign key constraints...');
      
      // Add foreign key to user_profiles
      try {
        await nile.db.query(`
          ALTER TABLE user_profiles 
          ADD CONSTRAINT IF NOT EXISTS fk_user_profiles_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
        console.log('✅ Added foreign key constraint to user_profiles');
      } catch (error) {
        console.log('❌ Failed to add foreign key to user_profiles:', error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Add foreign key to user_companies
      try {
        await nile.db.query(`
          ALTER TABLE user_companies 
          ADD CONSTRAINT IF NOT EXISTS fk_user_companies_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
        console.log('✅ Added foreign key constraint to user_companies');
      } catch (error) {
        console.log('❌ Failed to add foreign key to user_companies:', error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Add foreign key to audit_logs
      try {
        await nile.db.query(`
          ALTER TABLE audit_logs 
          ADD CONSTRAINT IF NOT EXISTS fk_audit_logs_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        `);
        console.log('✅ Added foreign key constraint to audit_logs');
      } catch (error) {
        console.log('❌ Failed to add foreign key to audit_logs:', error instanceof Error ? error.message : 'Unknown error');
      }
      
    } else {
      console.log('\n⚠️  Users table not found yet');
      console.log('💡 The users table will be created automatically when:');
      console.log('   1. A user signs up through NileDB auth API');
      console.log('   2. A user is created through the NileDB dashboard');
      console.log('   3. Authentication is properly configured and used');
      console.log('\n📋 Current schema is ready - foreign keys can be added later');
    }
    
    // Show current foreign key constraints
    console.log('\n🔍 Current Foreign Key Constraints:');
    const constraints = await nile.db.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `);
    
    if (constraints.rows.length > 0) {
      constraints.rows.forEach((constraint: { table_name: string; column_name: string; foreign_table_name: string; foreign_column_name: string; constraint_name: string }) => {
        console.log(`   ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      });
    } else {
      console.log('   No foreign key constraints found yet');
    }
    
  } catch (error) {
    console.error('❌ Failed to add foreign key constraints:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await addForeignKeyConstraints();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { addForeignKeyConstraints };
