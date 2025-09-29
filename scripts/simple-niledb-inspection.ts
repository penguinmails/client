#!/usr/bin/env tsx

/**
 * Simple NileDB Schema Inspection Script
 * 
 * This script examines NileDB's built-in tables and data structures
 * with a focus on avoiding connection pool issues.
 */

import { getNileClient } from '../lib/niledb/client';
import { validateDatabaseConnection } from '../lib/niledb/health';

/**
 * Simple table inspection
 */
async function inspectTables(): Promise<void> {
  const nile = getNileClient();
  
  console.log('🔍 Inspecting NileDB tables...\n');
  
  try {
    // List all tables
    const tablesResult = await nile.db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map((row: { table_name: string }) => row.table_name);
    console.log('📋 Available tables:', tables.join(', '));
    console.log();
    
    // Check for NileDB built-in tables
    const nileBuiltins = ['users', 'tenants'];
    const foundBuiltins = tables.filter((t: string) => nileBuiltins.includes(t));
    const customTables = tables.filter((t: string) => !nileBuiltins.includes(t) && t !== 'migrations');
    
    console.log('🏗️  NileDB Built-in Tables:');
    if (foundBuiltins.length > 0) {
      foundBuiltins.forEach((table: string) => console.log(`   ✅ ${table}`));
    } else {
      console.log('   ❌ No NileDB built-in tables found');
    }
    
    console.log('\n📊 Custom Tables:');
    if (customTables.length > 0) {
      customTables.forEach((table: string) => console.log(`   📋 ${table}`));
    } else {
      console.log('   ❌ No custom tables found');
    }
    
    // Examine users table if it exists
    if (tables.includes('users')) {
      console.log('\n👤 Users Table Schema:');
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
      
      console.log('   Columns:');
      usersSchema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }) => {
        console.log(`     ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Get row count
      const userCount = await nile.db.query('SELECT COUNT(*) as count FROM users');
      console.log(`   Data: ${userCount.rows[0].count} rows`);
      
      // Get sample data if any exists
      if (parseInt(userCount.rows[0].count) > 0) {
        const sampleUsers = await nile.db.query('SELECT * FROM users LIMIT 3');
        console.log('   Sample data:');
        sampleUsers.rows.forEach((user: unknown, index: number) => {
          console.log(`     User ${index + 1}:`, JSON.stringify(user, null, 2));
        });
      }
    }
    
    // Examine tenants table if it exists
    if (tables.includes('tenants')) {
      console.log('\n🏢 Tenants Table Schema:');
      const tenantsSchema = await nile.db.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('   Columns:');
      tenantsSchema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }) => {
        console.log(`     ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Get row count
      const tenantCount = await nile.db.query('SELECT COUNT(*) as count FROM tenants');
      console.log(`   Data: ${tenantCount.rows[0].count} rows`);
      
      // Get sample data if any exists
      if (parseInt(tenantCount.rows[0].count) > 0) {
        const sampleTenants = await nile.db.query('SELECT * FROM tenants LIMIT 3');
        console.log('   Sample data:');
        sampleTenants.rows.forEach((tenant: unknown, index: number) => {
          console.log(`     Tenant ${index + 1}:`, JSON.stringify(tenant, null, 2));
        });
      }
    }
    
    // Examine key custom tables
    const keyTables = ['companies', 'user_companies'];
    for (const tableName of keyTables) {
      if (tables.includes(tableName)) {
        console.log(`\n📋 ${tableName} Table Schema:`);
        const schema = await nile.db.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName]);
        
        console.log('   Columns:');
        schema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }) => {
          console.log(`     ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
        
        // Get row count
        const count = await nile.db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   Data: ${count.rows[0].count} rows`);
      }
    }
    
  } catch (error) {
    console.error('❌ Table inspection failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Test tenant context functionality
 */
async function testTenantContext(): Promise<void> {
  console.log('\n🔄 Testing tenant context...\n');
  
  try {
    const nile = getNileClient();
    
    // Test current tenant context
    const contextResult = await nile.db.query("SELECT current_setting('nile.tenant_id', true) as tenant_id");
    console.log('Current tenant context:', contextResult.rows[0].tenant_id || 'None');
    
    // Check if we have any tenants to test with
    const tenantCheck = await nile.db.query('SELECT id FROM tenants LIMIT 1');
    if (tenantCheck.rows.length > 0) {
      const testTenantId = tenantCheck.rows[0].id;
      console.log(`Testing with tenant ID: ${testTenantId}`);
      
      // This would test tenant context, but we'll skip it for now to avoid connection issues
      console.log('⚠️  Skipping tenant context test to avoid connection pool issues');
    } else {
      console.log('No tenants available for context testing');
    }
    
  } catch (error) {
    console.log('❌ Tenant context test failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🔍 Simple NileDB Schema Investigation\n');
  console.log('====================================\n');
  
  try {
    // Validate connection
    console.log('🔌 Validating database connection...');
    const connectionResult = await validateDatabaseConnection();
    
    if (!connectionResult.isValid) {
      console.error('❌ Database connection failed:', connectionResult.error);
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // Inspect tables
    await inspectTables();
    
    // Test tenant context
    await testTenantContext();
    
    console.log('\n📝 Summary:');
    console.log('===========');
    console.log('✅ Investigation completed successfully');
    console.log('📋 Check the output above for detailed schema information');
    console.log('📄 Full documentation will be generated in the next step');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { inspectTables, testTenantContext };
