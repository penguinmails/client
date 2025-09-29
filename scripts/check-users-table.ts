#!/usr/bin/env tsx

/**
 * Check Users Table Status
 * 
 * This script specifically checks for the users table and examines
 * NileDB's authentication setup.
 */

import { getNileClient } from '../lib/niledb/client';

interface Tenant {
  id: string;
  name: string;
}

async function checkUsersTable(): Promise<void> {
  console.log('👤 Checking Users Table Status\n');
  console.log('==============================\n');
  
  const nile = getNileClient();
  
  try {
    // Check all tables including system tables
    console.log('📋 All Tables in Database:');
    const allTables = await nile.db.query(`
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'nile', '_nile')
      ORDER BY table_schema, table_name
    `);
    
    allTables.rows.forEach((table: { table_schema: string; table_name: string; table_type: string }) => {
      console.log(`   ${table.table_schema}.${table.table_name} (${table.table_type})`);
    });
    
    // Specifically check for users table
    console.log('\n👤 Users Table Check:');
    const usersExists = await nile.db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
        AND table_schema = 'public'
      ) as exists;
    `);
    
    console.log(`   Users table exists: ${usersExists.rows[0].exists}`);
    
    if (usersExists.rows[0].exists) {
      // Get users table schema
      const usersSchema = await nile.db.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('\n   Users table schema:');
      usersSchema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }) => {
        console.log(`     ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Get users data
      const usersCount = await nile.db.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n   Users count: ${usersCount.rows[0].count}`);
      
      if (parseInt(usersCount.rows[0].count) > 0) {
        const sampleUsers = await nile.db.query('SELECT * FROM users LIMIT 3');
        console.log('\n   Sample users:');
        sampleUsers.rows.forEach((user: unknown, index: number) => {
          console.log(`     User ${index + 1}:`, JSON.stringify(user, null, 2));
        });
      }
    }
    
    // Check current session
    console.log('\n🔐 Authentication Status:');
    try {
      const session = await nile.auth.getSession();
      console.log('   Session:', session ? 'Active session found' : 'No active session');
      if (session) {
        console.log('   Session details:', JSON.stringify(session, null, 2));
      }
    } catch (error) {
      console.log('   Session check failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Check tenants
    console.log('\n🏢 Tenants Status:');
    const tenantsCount = await nile.db.query('SELECT COUNT(*) as count FROM tenants');
    console.log(`   Tenants count: ${tenantsCount.rows[0].count}`);
    
    if (parseInt(tenantsCount.rows[0].count) > 0) {
      const tenants = await nile.db.query('SELECT * FROM tenants');
      console.log('\n   Tenants:');
      tenants.rows.forEach((tenant: Tenant, index: number) => {
        console.log(`     Tenant ${index + 1}: ${tenant.name} (${tenant.id})`);
      });
    }
    
    // Test if we can query users through NileDB API
    console.log('\n🔍 NileDB API Test:');
    try {
      // Try different approaches to access users
      const directQuery = await nile.db.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name LIKE '%user%'
        AND table_schema = 'public'
      `);
      
      console.log('   Tables with "user" in name:', directQuery.rows.map((r: { table_name: string }) => r.table_name));
      
    } catch (error) {
      console.log('   API test failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await checkUsersTable();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { checkUsersTable };
