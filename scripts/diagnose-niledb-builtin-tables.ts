#!/usr/bin/env tsx

/**
 * NileDB Built-in Table Diagnostic Script
 * 
 * This script determines whether the users and tenants tables are actually
 * NileDB's built-in tables or custom tables that were accidentally created.
 */

import { getNileClient } from '../lib/niledb/client';

/**
 * Check if tables are NileDB built-ins by examining their characteristics
 */
async function diagnoseBuiltinTables(): Promise<void> {
  const nile = getNileClient();
  
  console.log('🔍 Diagnosing NileDB Built-in Tables\n');
  console.log('====================================\n');
  
  try {
    // Check users table characteristics
    console.log('👤 Analyzing Users Table:');
    
    // Get table owner and creation info
    const usersInfo = await nile.db.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE tablename = 'users'
    `);
    
    console.log('   Table Info:', usersInfo.rows[0]);
    
    // Check for NileDB-specific triggers or constraints
    const usersTriggers = await nile.db.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'users'
    `);
    
    console.log('   Triggers:', usersTriggers.rows.length > 0 ? usersTriggers.rows : 'None');
    
    // Check for NileDB-specific constraints
    const usersConstraints = await nile.db.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'users'
      AND constraint_type != 'CHECK'
    `);
    
    console.log('   Constraints:', usersConstraints.rows);
    
    // Check if we can use NileDB auth functions
    console.log('\n🔐 Testing NileDB Auth Integration:');
    try {
      // Try to get session (this would work with built-in users table)
      const session = await nile.auth.getSession();
      console.log('   Auth Session Test: ✅ Success (likely built-in table)');
      console.log('   Session:', session ? 'Active session found' : 'No active session');
    } catch (error) {
      console.log('   Auth Session Test: ❌ Failed (likely custom table)');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Check tenants table characteristics
    console.log('\n🏢 Analyzing Tenants Table:');
    
    const tenantsInfo = await nile.db.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE tablename = 'tenants'
    `);
    
    console.log('   Table Info:', tenantsInfo.rows[0]);
    
    // Check for NileDB-specific triggers
    const tenantsTriggers = await nile.db.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'tenants'
    `);
    
    console.log('   Triggers:', tenantsTriggers.rows.length > 0 ? tenantsTriggers.rows : 'None');
    
    // Test tenant context functionality
    console.log('\n🔄 Testing NileDB Tenant Context:');
    try {
      // Get a tenant ID to test with
      const tenantResult = await nile.db.query('SELECT id FROM tenants LIMIT 1');
      if (tenantResult.rows.length > 0) {
        const testTenantId = tenantResult.rows[0].id;
        
        // Try to set tenant context (this would work with built-in tenants table)
        const contextTest = await nile.db.query(`
          SELECT set_config('nile.tenant_id', $1, false) as result
        `, [testTenantId]);
        
        console.log('   Tenant Context Test: ✅ Success (likely built-in table)');
        console.log('   Context Set:', contextTest.rows[0].result);
        
        // Reset context
        await nile.db.query(`SELECT set_config('nile.tenant_id', '', false)`);
      } else {
        console.log('   Tenant Context Test: ⚠️  No tenants to test with');
      }
    } catch (error) {
      console.log('   Tenant Context Test: ❌ Failed (likely custom table)');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Check for NileDB system tables/views
    console.log('\n🗄️  Checking for NileDB System Objects:');
    
    const systemObjects = await nile.db.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND (
        table_name LIKE 'nile_%' OR
        table_name LIKE '%_nile_%' OR
        table_name IN ('tenant_users', 'user_tenants')
      )
      ORDER BY table_name
    `);
    
    if (systemObjects.rows.length > 0) {
      console.log('   NileDB System Objects Found:');
      systemObjects.rows.forEach((obj: { table_name: string; table_type: string }) => {
        console.log(`     ${obj.table_name} (${obj.table_type})`);
      });
    } else {
      console.log('   No NileDB system objects found');
    }
    
    // Final diagnosis
    console.log('\n🎯 Diagnosis Summary:');
    console.log('====================');
    
    const hasNileAuth = await testNileAuthIntegration();
    const hasNileTenantContext = await testNileTenantContextIntegration();
    
    if (hasNileAuth && hasNileTenantContext) {
      console.log('✅ VERDICT: These appear to be NileDB built-in tables');
      console.log('   - Auth integration works');
      console.log('   - Tenant context works');
      console.log('   - Tables have expected structure');
    } else if (!hasNileAuth && !hasNileTenantContext) {
      console.log('❌ VERDICT: These appear to be custom tables (NOT NileDB built-ins)');
      console.log('   - Auth integration fails');
      console.log('   - Tenant context fails');
      console.log('   - Tables were likely created by migration scripts');
    } else {
      console.log('⚠️  VERDICT: Mixed results - partial NileDB integration');
      console.log(`   - Auth integration: ${hasNileAuth ? 'Works' : 'Fails'}`);
      console.log(`   - Tenant context: ${hasNileTenantContext ? 'Works' : 'Fails'}`);
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Test NileDB auth integration
 */
async function testNileAuthIntegration(): Promise<boolean> {
  try {
    const nile = getNileClient();
    await nile.auth.getSession();
    return true;
  } catch {
    return false;
  }
}

/**
 * Test NileDB tenant context integration
 */
async function testNileTenantContextIntegration(): Promise<boolean> {
  try {
    const nile = getNileClient();
    const result = await nile.db.query(`SELECT current_setting('nile.tenant_id', true) as tenant_id`);
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Provide recommendations based on diagnosis
 */
async function provideRecommendations(): Promise<void> {
  console.log('\n💡 Recommendations:');
  console.log('==================');
  
  const hasNileAuth = await testNileAuthIntegration();
  const hasNileTenantContext = await testNileTenantContextIntegration();
  
  if (!hasNileAuth || !hasNileTenantContext) {
    console.log('\n🚨 CRITICAL: Custom tables detected instead of NileDB built-ins');
    console.log('\nOptions to fix this:');
    console.log('\n1. 🆕 CREATE NEW NILEDB DATABASE (RECOMMENDED):');
    console.log('   - Create a fresh NileDB database');
    console.log('   - This will have proper built-in users and tenants tables');
    console.log('   - Migrate your data to the new database');
    console.log('   - Update environment variables to point to new database');
    
    console.log('\n2. 🔄 DROP AND RECREATE TABLES (RISKY):');
    console.log('   - Drop the custom users and tenants tables');
    console.log('   - Let NileDB create its built-in tables');
    console.log('   - Risk: Data loss if not backed up properly');
    
    console.log('\n3. 🛠️  MANUAL MIGRATION (COMPLEX):');
    console.log('   - Export existing data');
    console.log('   - Drop custom tables');
    console.log('   - Initialize NileDB properly');
    console.log('   - Import data using NileDB APIs');
    
    console.log('\n🎯 RECOMMENDED APPROACH:');
    console.log('   1. Create a new empty NileDB database');
    console.log('   2. Update your environment variables');
    console.log('   3. Run proper NileDB initialization');
    console.log('   4. Migrate data using NileDB-aware scripts');
    
  } else {
    console.log('\n✅ Tables appear to be NileDB built-ins');
    console.log('   - Continue with current implementation');
    console.log('   - Focus on service layer development');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await diagnoseBuiltinTables();
  await provideRecommendations();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { diagnoseBuiltinTables, testNileAuthIntegration, testNileTenantContextIntegration };
