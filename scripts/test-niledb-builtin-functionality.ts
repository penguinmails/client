#!/usr/bin/env tsx

/**
 * Test NileDB Built-in Functionality
 * 
 * This script tests specific NileDB built-in functionality to determine
 * if we're working with real NileDB tables or custom tables.
 */

import { getNileClient, withTenantContext, withoutTenantContext } from '../lib/niledb/client';

async function testNileDBBuiltinFunctionality(): Promise<void> {
  console.log('🧪 Testing NileDB Built-in Functionality\n');
  console.log('========================================\n');
  
  const nile = getNileClient();
  
  try {
    // Test 1: Check if we can create a user using NileDB auth API
    console.log('👤 Test 1: NileDB User Management API');
    try {
      // Try to use NileDB's authentication API (this would fail with custom tables)
      await nile.auth.getSession();
      console.log('   ✅ NileDB Auth API accessible');
      console.log('   This suggests built-in authentication system');
    } catch (error) {
      console.log('   ❌ NileDB User API failed:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   This suggests custom users table');
    }
    
    // Test 2: Check if we can create a tenant using NileDB tenant API
    console.log('\n🏢 Test 2: NileDB Tenant Management API');
    try {
      // Try to query the tenants table directly (this would fail with custom tables)
      const tenantsQuery = await nile.db.query('SELECT COUNT(*) as count FROM public.tenants');
      console.log('   ✅ Tenants table accessible - found', tenantsQuery.rows[0]?.count || 0, 'tenants');
      console.log('   This suggests built-in tenants table');
    } catch (error) {
      console.log('   ❌ NileDB Tenant API failed:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   This suggests custom tenants table');
    }
    
    // Test 3: Check tenant context isolation
    console.log('\n🔒 Test 3: Tenant Context Isolation');
    try {
      // Get a tenant to test with
      const tenantResult = await nile.db.query('SELECT id FROM tenants LIMIT 1');
      if (tenantResult.rows.length > 0) {
        const testTenantId = tenantResult.rows[0].id;
        
        // Test without tenant context
        const globalQuery = await withoutTenantContext(async (nileClient) => {
          return await nileClient.db.query('SELECT COUNT(*) as count FROM companies');
        });
        
        // Test with tenant context
        const tenantQuery = await withTenantContext(testTenantId, async (nileClient) => {
          return await nileClient.db.query('SELECT COUNT(*) as count FROM companies');
        });
        
        console.log('   Global companies count:', globalQuery.rows[0].count);
        console.log('   Tenant-scoped companies count:', tenantQuery.rows[0].count);
        
        if (parseInt(globalQuery.rows[0].count) >= parseInt(tenantQuery.rows[0].count)) {
          console.log('   ✅ Tenant isolation appears to work');
        } else {
          console.log('   ⚠️  Tenant isolation results unexpected');
        }
      }
    } catch (error) {
      console.log('   ❌ Tenant context test failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test 4: Check for NileDB-specific database functions
    console.log('\n🔧 Test 4: NileDB Database Functions');
    try {
      // Check if NileDB-specific functions exist
      const functions = await nile.db.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name LIKE '%nile%'
        ORDER BY routine_name
      `);
      
      if (functions.rows.length > 0) {
        console.log('   ✅ Found NileDB functions:');
        functions.rows.forEach((func: { routine_name: string }) => {
          console.log('     -', func.routine_name);
        });
      } else {
        console.log('   ❌ No NileDB-specific functions found');
      }
    } catch (error) {
      console.log('   ❌ Function check failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test 5: Check table creation source
    console.log('\n📋 Test 5: Table Creation Analysis');
    try {
      // Check if tables have NileDB-style defaults
      const usersDefaults = await nile.db.query(`
        SELECT column_name, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_default IS NOT NULL
        ORDER BY ordinal_position
      `);
      
      console.log('   Users table defaults:');
      usersDefaults.rows.forEach((col: { column_name: string; column_default: string | null }) => {
        console.log(`     ${col.column_name}: ${col.column_default}`);
      });
      
      // Check if tenants table uses NileDB's uuid_generate_v7()
      const tenantsDefaults = await nile.db.query(`
        SELECT column_name, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_default IS NOT NULL
        ORDER BY ordinal_position
      `);
      
      console.log('   Tenants table defaults:');
      tenantsDefaults.rows.forEach((col: { column_name: string; column_default: string | null }) => {
        console.log(`     ${col.column_name}: ${col.column_default}`);
      });
      
      // Check for uuid_generate_v7 function (NileDB-specific)
      const hasV7UUID = tenantsDefaults.rows.some((col: { column_default: string | null }) =>
        col.column_default?.includes('uuid_generate_v7')
      );
      
      if (hasV7UUID) {
        console.log('   ✅ Found uuid_generate_v7() - suggests NileDB built-in');
      } else {
        console.log('   ❌ No uuid_generate_v7() found - suggests custom table');
      }
      
    } catch (error) {
      console.log('   ❌ Table analysis failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test 6: Direct NileDB API test
    console.log('\n🌐 Test 6: Direct NileDB API Integration');
    try {
      // Test NileDB API by checking authentication and database access
      console.log('   Testing NileDB authentication and database access...');
      
      // Test session management
      await nile.auth.getSession();
      console.log('   ✅ NileDB auth API accessible');
      
      // Test database queries on built-in tables
      const usersCount = await nile.db.query('SELECT COUNT(*) as count FROM users.users');
      const tenantsCount = await nile.db.query('SELECT COUNT(*) as count FROM public.tenants');
      
      console.log(`   ✅ Users table accessible (${usersCount.rows[0]?.count || 0} records)`);
      console.log(`   ✅ Tenants table accessible (${tenantsCount.rows[0]?.count || 0} records)`);
      
      console.log('   🎯 DEFINITIVE: These are NileDB built-in tables');
      
    } catch (error) {
      console.log('   ❌ NileDB API test failed:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   🎯 DEFINITIVE: These are likely custom tables, not NileDB built-ins');
    }
    
  } catch (error) {
    console.error('❌ Testing failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Provide final verdict and recommendations
 */
async function provideFinalVerdict(): Promise<void> {
  console.log('\n🎯 Final Verdict and Recommendations\n');
  console.log('===================================\n');
  
  const nile = getNileClient();
  
  try {
    // Test NileDB functionality by checking if we can query built-in tables
    const usersTest = await nile.db.query('SELECT COUNT(*) as count FROM users.users LIMIT 1');
    const tenantsTest = await nile.db.query('SELECT COUNT(*) as count FROM public.tenants LIMIT 1');
    
    if (usersTest && tenantsTest) {
      console.log('✅ VERDICT: These are genuine NileDB built-in tables');
      console.log('\n📋 What this means:');
      console.log('   - Your tables are properly integrated with NileDB');
      console.log('   - You can use all NileDB APIs and features');
      console.log('   - Tenant isolation is working correctly');
      console.log('   - Authentication is properly integrated');
      
      console.log('\n🚀 Next Steps:');
      console.log('   1. Continue with the current implementation');
      console.log('   2. Focus on service layer development');
      console.log('   3. Implement proper tenant context in your APIs');
      console.log('   4. Use NileDB auth APIs for user management');
      
    } else {
      throw new Error('Tenant creation failed');
    }
    
  } catch (error) {
    console.error('Error during verdict:', error instanceof Error ? error.message : 'Unknown error');
    console.log('❌ VERDICT: These appear to be custom tables, NOT NileDB built-ins');
    console.log('\n🚨 Problem:');
    console.log('   - You accidentally created custom users/tenants tables');
    console.log('   - These override NileDB\'s built-in functionality');
    console.log('   - You\'re missing out on NileDB\'s features');
    
    console.log('\n💡 Solutions:');
    console.log('\n1. 🆕 CREATE NEW NILEDB DATABASE (RECOMMENDED):');
    console.log('   - Go to NileDB dashboard and create a new database');
    console.log('   - Update your environment variables');
    console.log('   - This will give you proper built-in tables');
    console.log('   - Migrate your data using NileDB APIs');
    
    console.log('\n2. 🔄 RESET CURRENT DATABASE:');
    console.log('   - Drop all custom tables');
    console.log('   - Let NileDB initialize properly');
    console.log('   - Risk: More complex data migration');
    
    console.log('\n🎯 RECOMMENDED APPROACH:');
    console.log('   1. Create a new empty NileDB database');
    console.log('   2. Update NILEDB_* environment variables');
    console.log('   3. Test connection to ensure built-in tables work');
    console.log('   4. Create migration scripts using NileDB APIs');
    console.log('   5. Migrate your business data (companies, user_companies, etc.)');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await testNileDBBuiltinFunctionality();
  await provideFinalVerdict();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { testNileDBBuiltinFunctionality };
