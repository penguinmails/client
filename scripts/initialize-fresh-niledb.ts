#!/usr/bin/env tsx

/**
 * Initialize Fresh NileDB Database
 * 
 * This script initializes a fresh NileDB database and explores
 * the actual built-in table structures.
 */

import { getNileClient } from '../lib/niledb/client';

async function initializeNileDB(): Promise<void> {
  console.log('🚀 Initializing Fresh NileDB Database\n');
  console.log('====================================\n');
  
  const nile = getNileClient();
  
  try {
    // Step 1: Check current tables
    console.log('📋 Step 1: Current Database State');
    const currentTables = await nile.db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('   Current tables:', currentTables.rows.map((r: { table_name: string }) => r.table_name).join(', ') || 'None');
    
    // Step 2: Examine the tenants table (NileDB built-in)
    if (currentTables.rows.some((r: { table_name: string }) => r.table_name === 'tenants')) {
      console.log('\n🏢 Step 2: Examining NileDB Built-in Tenants Table');
      
      const tenantsSchema = await nile.db.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('   Tenants table schema:');
      tenantsSchema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null; character_maximum_length: number | null }) => {
        console.log(`     ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
    // Step 3: Try to trigger users table creation
    console.log('\n👤 Step 3: Triggering Users Table Creation');
    try {
      // Try to access auth session (this should trigger users table creation)
      await nile.auth.getSession();
      console.log('   ✅ Auth session accessed successfully');
    } catch (error) {
      console.log('   ⚠️  Auth session access failed (expected for empty DB):', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Check if users table was created
    const tablesAfterAuth = await nile.db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('   Tables after auth access:', tablesAfterAuth.rows.map((r: { table_name: string }) => r.table_name).join(', '));
    
    // Step 4: Create a test tenant to see the full structure
    console.log('\n🏗️  Step 4: Creating Test Tenant');
    try {
      const testTenant = await nile.db.query(`
        INSERT INTO tenants (name) 
        VALUES ($1) 
        RETURNING id, name, created, updated
      `, [`test-tenant-${Date.now()}`]);
      
      console.log('   ✅ Test tenant created:', testTenant.rows[0]);
      
      // Step 5: Test tenant context
      console.log('\n🔄 Step 5: Testing Tenant Context');
      const tenantId = testTenant.rows[0].id;
      
      // Set tenant context
      await nile.db.query(`SELECT set_config('nile.tenant_id', $1, false)`, [tenantId]);
      
      // Check context
      const contextCheck = await nile.db.query(`SELECT current_setting('nile.tenant_id', true) as tenant_id`);
      console.log('   Current tenant context:', contextCheck.rows[0].tenant_id);
      
      // Reset context
      await nile.db.query(`SELECT set_config('nile.tenant_id', '', false)`);
      
      // Clean up test tenant
      await nile.db.query(`DELETE FROM tenants WHERE id = $1`, [tenantId]);
      console.log('   ✅ Test tenant cleaned up');
      
    } catch (error) {
      console.log('   ❌ Tenant creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Step 6: Check for NileDB system functions
    console.log('\n🔧 Step 6: Checking NileDB System Functions');
    try {
      const functions = await nile.db.query(`
        SELECT 
          routine_name,
          routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        ORDER BY routine_name
      `);
      
      if (functions.rows.length > 0) {
        console.log('   Available functions:');
        functions.rows.forEach((func: { routine_name: string; routine_type: string }) => {
          console.log(`     ${func.routine_name} (${func.routine_type})`);
        });
      } else {
        console.log('   No custom functions found');
      }
    } catch (error) {
      console.log('   ❌ Function check failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Step 7: Final assessment
    console.log('\n🎯 Step 7: Database Assessment');
    const finalTables = await nile.db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const hasUsers = finalTables.rows.some((r: { table_name: string }) => r.table_name === 'users');
    const hasTenants = finalTables.rows.some((r: { table_name: string }) => r.table_name === 'tenants');
    
    console.log(`   Users table: ${hasUsers ? '✅ Present' : '❌ Not created yet'}`);
    console.log(`   Tenants table: ${hasTenants ? '✅ Present' : '❌ Missing'}`);
    
    if (hasTenants) {
      console.log('\n✅ NileDB is properly initialized with built-in tenants table');
      if (!hasUsers) {
        console.log('💡 Users table will be created automatically when first user is created');
      }
    } else {
      console.log('\n❌ NileDB initialization incomplete');
    }
    
  } catch (error) {
    console.error('❌ Initialization failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Analyze table structure for migration planning
 */
async function analyzeForMigration(): Promise<void> {
  console.log('\n📊 Migration Planning Analysis\n');
  console.log('=============================\n');
  
  const nile = getNileClient();
  
  try {
    // Get current table structure
    const tables = await nile.db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('🏗️  Current NileDB Built-in Tables:');
    
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`\n📋 ${tableName} table:`);
      
      const schema = await nile.db.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);
      
      schema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null; character_maximum_length: number | null }) => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
      });
    }
    
    console.log('\n🎯 Migration Strategy:');
    console.log('\n1. **NileDB Built-in Tables** (use as-is):');
    console.log('   - tenants: For top-level organizational units');
    console.log('   - users: Will be created automatically for authentication');
    
    console.log('\n2. **Custom Tables to Create**:');
    console.log('   - companies: Business entities within tenants');
    console.log('   - user_companies: User-company relationships within tenants');
    console.log('   - All other business logic tables');
    
    console.log('\n3. **Key Differences from Old Schema**:');
    console.log('   - NileDB tenants use uuid_generate_v7() for IDs');
    console.log('   - NileDB uses "created"/"updated" instead of "created_at"/"updated_at"');
    console.log('   - Users table will have NileDB-specific auth fields');
    
    console.log('\n4. **Recommended Approach**:');
    console.log('   - Use NileDB built-in users/tenants for auth and multi-tenancy');
    console.log('   - Create custom companies table that references tenants.id');
    console.log('   - Create user_companies junction table for business relationships');
    console.log('   - Migrate existing business data to new structure');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await initializeNileDB();
  await analyzeForMigration();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { initializeNileDB, analyzeForMigration };
