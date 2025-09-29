#!/usr/bin/env tsx

/**
 * Investigate Admin Panel Capabilities
 * 
 * This script tests NileDB's ability to perform cross-tenant admin queries
 * and investigates limitations for admin panel functionality.
 */

import { getNileClient, withTenantContext, withoutTenantContext } from '../lib/niledb/client';

interface AdminTestResult {
  test: string;
  status: 'success' | 'failed' | 'limited';
  message: string;
  data?: Record<string, unknown>[];
  limitation?: string;
}

/**
 * Test cross-tenant company queries
 */
async function testCrossTenantCompanyQueries(): Promise<AdminTestResult[]> {
  const nile = getNileClient();
  const results: AdminTestResult[] = [];
  
  // First, let's create some test data
  console.log('🏗️  Setting up test data...');
  
  try {
    // Create a second tenant for testing
    const tenant2 = await nile.db.query(`
      INSERT INTO tenants (name) 
      VALUES ('Test Company 2') 
      RETURNING id, name
    `);
    console.log('   ✅ Created test tenant:', tenant2.rows[0]);
    
    // Get existing tenant
    const existingTenant = await nile.db.query('SELECT id, name FROM tenants WHERE name != $1', ['Test Company 2']);
    
    // Create companies in both tenants
    await nile.db.query(`
      INSERT INTO companies (tenant_id, name, email)
      VALUES ($1, 'Company A', 'companya@example.com')
      RETURNING id, tenant_id, name
    `, [existingTenant.rows[0].id]);

    await nile.db.query(`
      INSERT INTO companies (tenant_id, name, email)
      VALUES ($1, 'Company B', 'companyb@example.com')
      RETURNING id, tenant_id, name
    `, [tenant2.rows[0].id]);
    
    console.log('   ✅ Created test companies');
    
  } catch (error) {
    console.log('   ⚠️  Test data setup (companies may already exist):', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Test 1: Query all companies without tenant context
  try {
    const allCompanies = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          c.id,
          c.name,
          c.email,
          c.tenant_id,
          t.name as tenant_name
        FROM companies c
        JOIN tenants t ON c.tenant_id = t.id
        WHERE c.deleted IS NULL
        ORDER BY c.name
      `);
    });
    
    results.push({
      test: 'All Companies Query (No Tenant Context)',
      status: 'success',
      message: `Successfully retrieved ${allCompanies.rows.length} companies across all tenants`,
      data: allCompanies.rows
    });
    
  } catch (error) {
    results.push({
      test: 'All Companies Query (No Tenant Context)',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Query companies with specific tenant context
  try {
    const tenants = await nile.db.query('SELECT id, name FROM tenants LIMIT 1');
    if (tenants.rows.length > 0) {
      const tenantId = tenants.rows[0].id;
      
      const tenantCompanies = await withTenantContext(tenantId, async (nileClient) => {
        return await nileClient.db.query(`
          SELECT id, name, email, tenant_id
          FROM companies
          WHERE deleted IS NULL
          ORDER BY name
        `);
      });
      
      results.push({
        test: 'Tenant-Scoped Companies Query',
        status: 'success',
        message: `Retrieved ${tenantCompanies.rows.length} companies for tenant ${tenants.rows[0].name}`,
        data: tenantCompanies.rows
      });
    }
    
  } catch (error) {
    results.push({
      test: 'Tenant-Scoped Companies Query',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 3: Compare results - check if tenant context limits data
  try {
    const allCompaniesCount = await withoutTenantContext(async (nileClient) => {
      const result = await nileClient.db.query('SELECT COUNT(*) as count FROM companies WHERE deleted IS NULL');
      return parseInt(result.rows[0].count);
    });
    
    const tenants = await nile.db.query('SELECT id FROM tenants');
    let tenantScopedTotal = 0;
    
    for (const tenant of tenants.rows) {
      const tenantCount = await withTenantContext(tenant.id, async (nileClient) => {
        const result = await nileClient.db.query('SELECT COUNT(*) as count FROM companies WHERE deleted IS NULL');
        return parseInt(result.rows[0].count);
      });
      tenantScopedTotal += tenantCount;
    }
    
    results.push({
      test: 'Tenant Context vs No Context Comparison',
      status: allCompaniesCount === tenantScopedTotal ? 'success' : 'limited',
      message: `No context: ${allCompaniesCount} companies, Tenant-scoped total: ${tenantScopedTotal} companies`,
      limitation: allCompaniesCount !== tenantScopedTotal ? 'Tenant context may be filtering results' : undefined
    });
    
  } catch (error) {
    results.push({
      test: 'Tenant Context vs No Context Comparison',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
}

/**
 * Test cross-tenant user admin queries
 */
async function testCrossTenantUserQueries(): Promise<AdminTestResult[]> {
  const results: AdminTestResult[] = [];
  
  // Test 1: Query all users across tenants
  try {
    const allUsers = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          u.id,
          u.email,
          u.name,
          up.role,
          up.is_penguinmails_staff,
          tu.tenant_id,
          t.name as tenant_name,
          tu.roles as tenant_roles
        FROM users.users u
        LEFT JOIN public.user_profiles up ON u.id = up.user_id
        LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
        LEFT JOIN public.tenants t ON tu.tenant_id = t.id
        WHERE u.deleted IS NULL
        ORDER BY u.email
      `);
    });
    
    results.push({
      test: 'All Users Cross-Schema Query',
      status: 'success',
      message: `Successfully retrieved ${allUsers.rows.length} users with tenant relationships`,
      data: allUsers.rows
    });
    
  } catch (error) {
    results.push({
      test: 'All Users Cross-Schema Query',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Query admin users across all tenants
  try {
    const adminUsers = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          u.id,
          u.email,
          u.name,
          up.role,
          up.is_penguinmails_staff,
          COUNT(DISTINCT tu.tenant_id) as tenant_count,
          ARRAY_AGG(DISTINCT t.name) as tenant_names
        FROM users.users u
        LEFT JOIN public.user_profiles up ON u.id = up.user_id
        LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
        LEFT JOIN public.tenants t ON tu.tenant_id = t.id
        WHERE u.deleted IS NULL
          AND (up.role IN ('admin', 'super_admin') OR up.is_penguinmails_staff = true)
        GROUP BY u.id, u.email, u.name, up.role, up.is_penguinmails_staff
        ORDER BY up.is_penguinmails_staff DESC, up.role
      `);
    });
    
    results.push({
      test: 'Admin Users Across All Tenants',
      status: 'success',
      message: `Found ${adminUsers.rows.length} admin users across all tenants`,
      data: adminUsers.rows
    });
    
  } catch (error) {
    results.push({
      test: 'Admin Users Across All Tenants',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 3: Query user-company relationships across tenants
  try {
    const userCompanyRelations = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          u.email,
          c.name as company_name,
          uc.role as company_role,
          t.name as tenant_name,
          uc.permissions
        FROM users.users u
        JOIN public.user_companies uc ON u.id = uc.user_id
        JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
        JOIN public.tenants t ON uc.tenant_id = t.id
        WHERE u.deleted IS NULL 
          AND uc.deleted IS NULL 
          AND c.deleted IS NULL
        ORDER BY u.email, t.name, c.name
      `);
    });
    
    results.push({
      test: 'User-Company Relationships Across Tenants',
      status: 'success',
      message: `Found ${userCompanyRelations.rows.length} user-company relationships`,
      data: userCompanyRelations.rows
    });
    
  } catch (error) {
    results.push({
      test: 'User-Company Relationships Across Tenants',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
}

/**
 * Test admin access to payment and billing data
 */
async function testAdminBillingQueries(): Promise<AdminTestResult[]> {
  const nile = getNileClient();
  const results: AdminTestResult[] = [];
  
  // First, create some test billing data
  try {
    const tenants = await nile.db.query('SELECT id FROM tenants LIMIT 2');
    
    for (const tenant of tenants.rows) {
      await nile.db.query(`
        INSERT INTO tenant_billing (tenant_id, plan, billing_email, subscription_status) 
        VALUES ($1, 'pro', 'billing@example.com', 'active')
        ON CONFLICT (tenant_id) DO UPDATE SET 
          plan = EXCLUDED.plan,
          subscription_status = EXCLUDED.subscription_status
      `, [tenant.id]);
    }
    
    console.log('   ✅ Created test billing data');
    
  } catch (error) {
    console.log('   ⚠️  Billing data setup:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Test 1: Query all billing information across tenants
  try {
    const allBilling = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          tb.id,
          tb.tenant_id,
          t.name as tenant_name,
          tb.plan,
          tb.billing_email,
          tb.subscription_status,
          tb.current_period_start,
          tb.current_period_end,
          tb.stripe_customer_id
        FROM tenant_billing tb
        JOIN tenants t ON tb.tenant_id = t.id
        WHERE tb.deleted IS NULL
        ORDER BY t.name
      `);
    });
    
    results.push({
      test: 'All Tenant Billing Information',
      status: 'success',
      message: `Retrieved billing information for ${allBilling.rows.length} tenants`,
      data: allBilling.rows
    });
    
  } catch (error) {
    results.push({
      test: 'All Tenant Billing Information',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Aggregate billing statistics
  try {
    const billingStats = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          tb.plan,
          tb.subscription_status,
          COUNT(*) as tenant_count,
          ARRAY_AGG(t.name) as tenant_names
        FROM tenant_billing tb
        JOIN tenants t ON tb.tenant_id = t.id
        WHERE tb.deleted IS NULL
        GROUP BY tb.plan, tb.subscription_status
        ORDER BY tb.plan, tb.subscription_status
      `);
    });
    
    results.push({
      test: 'Billing Statistics Aggregation',
      status: 'success',
      message: `Generated billing statistics across ${billingStats.rows.length} plan/status combinations`,
      data: billingStats.rows
    });
    
  } catch (error) {
    results.push({
      test: 'Billing Statistics Aggregation',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
}

/**
 * Test staff user privilege escalation
 */
async function testStaffUserPrivileges(): Promise<AdminTestResult[]> {
  const nile = getNileClient();
  const results: AdminTestResult[] = [];
  
  // Test 1: Identify staff users and their capabilities
  try {
    const staffUsers = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT 
          u.id,
          u.email,
          u.name,
          up.role,
          up.is_penguinmails_staff,
          COUNT(DISTINCT tu.tenant_id) as accessible_tenants,
          ARRAY_AGG(DISTINCT t.name) as tenant_names
        FROM users.users u
        JOIN public.user_profiles up ON u.id = up.user_id
        LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
        LEFT JOIN public.tenants t ON tu.tenant_id = t.id
        WHERE up.is_penguinmails_staff = true
        GROUP BY u.id, u.email, u.name, up.role, up.is_penguinmails_staff
        ORDER BY up.role DESC
      `);
    });
    
    results.push({
      test: 'Staff User Identification',
      status: 'success',
      message: `Found ${staffUsers.rows.length} staff users with tenant access`,
      data: staffUsers.rows
    });
    
  } catch (error) {
    results.push({
      test: 'Staff User Identification',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Test if staff users can access all tenant data
  try {
    const currentUser = await nile.db.query(`
      SELECT u.id, up.is_penguinmails_staff 
      FROM users.users u 
      JOIN user_profiles up ON u.id = up.user_id 
      LIMIT 1
    `);
    
    if (currentUser.rows.length > 0 && currentUser.rows[0].is_penguinmails_staff) {
      // Test cross-tenant access for staff user
      const crossTenantAccess = await withoutTenantContext(async (nileClient) => {
        return await nileClient.db.query(`
          SELECT 
            t.name as tenant_name,
            COUNT(DISTINCT c.id) as company_count,
            COUNT(DISTINCT uc.user_id) as user_count
          FROM tenants t
          LEFT JOIN companies c ON t.id = c.tenant_id AND c.deleted IS NULL
          LEFT JOIN user_companies uc ON t.id = uc.tenant_id AND uc.deleted IS NULL
          GROUP BY t.id, t.name
          ORDER BY t.name
        `);
      });
      
      results.push({
        test: 'Staff User Cross-Tenant Access',
        status: 'success',
        message: `Staff user can access data across ${crossTenantAccess.rows.length} tenants`,
        data: crossTenantAccess.rows
      });
      
    } else {
      results.push({
        test: 'Staff User Cross-Tenant Access',
        status: 'limited',
        message: 'Current user is not staff - cannot test staff privileges',
        limitation: 'Need staff user to test cross-tenant access capabilities'
      });
    }
    
  } catch (error) {
    results.push({
      test: 'Staff User Cross-Tenant Access',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
}

/**
 * Test NileDB tenant context behavior
 */
async function testTenantContextBehavior(): Promise<AdminTestResult[]> {
  const nile = getNileClient();
  const results: AdminTestResult[] = [];
  
  // Test 1: Compare query results with and without tenant context
  try {
    const withoutContext = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query('SELECT COUNT(*) as count FROM companies');
    });
    
    const tenants = await nile.db.query('SELECT id FROM tenants LIMIT 1');
    let withContext = { rows: [{ count: '0' }] };
    
    if (tenants.rows.length > 0) {
      withContext = await withTenantContext(tenants.rows[0].id, async (nileClient) => {
        return await nileClient.db.query('SELECT COUNT(*) as count FROM companies');
      });
    }
    
    const withoutCount = parseInt(withoutContext.rows[0]['count'] as string);
    const withCount = parseInt(withContext.rows[0]['count'] as string);
    
    results.push({
      test: 'Tenant Context Impact on Queries',
      status: withoutCount >= withCount ? 'success' : 'limited',
      message: `Without context: ${withoutCount} companies, With context: ${withCount} companies`,
      limitation: withoutCount < withCount ? 'Tenant context may be adding unexpected data' : undefined
    });
    
  } catch (error) {
    results.push({
      test: 'Tenant Context Impact on Queries',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Test if we can query across schemas with different contexts
  try {
    const crossSchemaWithoutContext = await withoutTenantContext(async (nileClient) => {
      return await nileClient.db.query(`
        SELECT COUNT(*) as count 
        FROM users.users u 
        JOIN users.tenant_users tu ON u.id = tu.user_id
      `);
    });
    
    const tenants = await nile.db.query('SELECT id FROM tenants LIMIT 1');
    let crossSchemaWithContext = { rows: [{ count: '0' }] };
    
    if (tenants.rows.length > 0) {
      crossSchemaWithContext = await withTenantContext(tenants.rows[0].id, async (nileClient) => {
        return await nileClient.db.query(`
          SELECT COUNT(*) as count 
          FROM users.users u 
          JOIN users.tenant_users tu ON u.id = tu.user_id
        `);
      });
    }
    
    results.push({
      test: 'Cross-Schema Queries with Tenant Context',
      status: 'success',
      message: `Cross-schema queries work both with and without tenant context`,
      data: [{
        without_context: crossSchemaWithoutContext.rows[0].count,
        with_context: crossSchemaWithContext.rows[0].count
      }]
    });
    
  } catch (error) {
    results.push({
      test: 'Cross-Schema Queries with Tenant Context',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
}

/**
 * Main investigation function
 */
async function investigateAdminCapabilities(): Promise<void> {
  console.log('🔍 Investigating Admin Panel Capabilities\n');
  console.log('=========================================\n');
  
  const allResults: AdminTestResult[] = [];
  
  try {
    console.log('🏢 Testing Cross-Tenant Company Queries...');
    const companyResults = await testCrossTenantCompanyQueries();
    allResults.push(...companyResults);
    
    console.log('\n👤 Testing Cross-Tenant User Queries...');
    const userResults = await testCrossTenantUserQueries();
    allResults.push(...userResults);
    
    console.log('\n💳 Testing Admin Billing Queries...');
    const billingResults = await testAdminBillingQueries();
    allResults.push(...billingResults);
    
    console.log('\n🔐 Testing Staff User Privileges...');
    const staffResults = await testStaffUserPrivileges();
    allResults.push(...staffResults);
    
    console.log('\n🔄 Testing Tenant Context Behavior...');
    const contextResults = await testTenantContextBehavior();
    allResults.push(...contextResults);
    
    // Generate comprehensive report
    console.log('\n📊 Admin Panel Capability Assessment');
    console.log('====================================\n');
    
    const successful = allResults.filter(r => r.status === 'success').length;
    const failed = allResults.filter(r => r.status === 'failed').length;
    const limited = allResults.filter(r => r.status === 'limited').length;
    
    console.log('📈 Summary:');
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Limited: ${limited}`);
    console.log(`   📋 Total Tests: ${allResults.length}`);
    
    console.log('\n🔍 Detailed Results:');
    allResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      console.log(`\n${icon} ${result.test}`);
      console.log(`   ${result.message}`);
      
      if (result.limitation) {
        console.log(`   ⚠️  Limitation: ${result.limitation}`);
      }
      
      if (result.data && result.data.length > 0) {
        console.log(`   📊 Sample Data (${result.data.length} records):`);
        result.data.slice(0, 2).forEach((item, index) => {
          console.log(`     ${index + 1}. ${JSON.stringify(item, null, 2)}`);
        });
        if (result.data.length > 2) {
          console.log(`     ... and ${result.data.length - 2} more records`);
        }
      }
    });
    
    // Generate recommendations
    console.log('\n💡 Admin Panel Recommendations:');
    console.log('==============================\n');
    
    if (successful >= allResults.length * 0.8) {
      console.log('✅ **ADMIN PANEL FEASIBLE**: NileDB supports comprehensive admin functionality');
      console.log('\n🎯 Recommended Admin Panel Architecture:');
      console.log('   1. Use `withoutTenantContext()` for all admin queries');
      console.log('   2. Implement staff user identification via `is_penguinmails_staff` field');
      console.log('   3. Cross-schema queries work well for user-tenant-company relationships');
      console.log('   4. Billing and payment data is fully accessible across tenants');
      console.log('   5. Use role-based access control with `user_profiles.role` field');
    } else {
      console.log('⚠️  **ADMIN PANEL LIMITED**: Some NileDB limitations detected');
      console.log('\n🔧 Required Workarounds:');
      allResults.filter(r => r.limitation).forEach(result => {
        console.log(`   - ${result.test}: ${result.limitation}`);
      });
    }
    
    console.log('\n🏗️  Admin Panel Implementation Strategy:');
    console.log('   1. **Staff Authentication**: Check `user_profiles.is_penguinmails_staff = true`');
    console.log('   2. **Cross-Tenant Queries**: Use `withoutTenantContext()` for admin operations');
    console.log('   3. **Data Access**: All business data accessible via cross-schema joins');
    console.log('   4. **Security**: Implement additional authorization checks in application layer');
    console.log('   5. **Performance**: Consider caching for frequently accessed admin data');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await investigateAdminCapabilities();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { investigateAdminCapabilities };
