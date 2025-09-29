#!/usr/bin/env tsx

/**
 * NileDB Data Integrity Validation Script
 * 
 * This script validates the data integrity and relationships in the current
 * NileDB implementation to ensure all foreign key relationships are intact
 * and the data is consistent.
 */

import { getNileClient } from '../lib/niledb/client';

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: Record<string, unknown>[];
}

/**
 * Validate user-company relationships
 */
async function validateUserCompanyRelationships(): Promise<ValidationResult[]> {
  const nile = getNileClient();
  const results: ValidationResult[] = [];
  
  try {
    // Test 1: All user_companies.user_id references exist in users table
    const orphanedUserCompanies = await nile.db.query(`
      SELECT uc.id, uc.user_id, uc.tenant_id, uc.company_id
      FROM user_companies uc
      LEFT JOIN users u ON uc.user_id = u.id
      WHERE u.id IS NULL
    `);
    
    results.push({
      test: 'User-Company User References',
      status: orphanedUserCompanies.rows.length === 0 ? 'PASS' : 'FAIL',
      message: orphanedUserCompanies.rows.length === 0 
        ? 'All user_companies records reference valid users'
        : `Found ${orphanedUserCompanies.rows.length} user_companies records with invalid user_id references`,
      details: orphanedUserCompanies.rows.length > 0 ? orphanedUserCompanies.rows : undefined
    });
    
    // Test 2: All user_companies.company_id references exist in companies table
    const orphanedCompanyRelations = await nile.db.query(`
      SELECT uc.id, uc.user_id, uc.tenant_id, uc.company_id
      FROM user_companies uc
      LEFT JOIN companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
      WHERE c.id IS NULL
    `);
    
    results.push({
      test: 'User-Company Company References',
      status: orphanedCompanyRelations.rows.length === 0 ? 'PASS' : 'FAIL',
      message: orphanedCompanyRelations.rows.length === 0
        ? 'All user_companies records reference valid companies'
        : `Found ${orphanedCompanyRelations.rows.length} user_companies records with invalid company_id references`,
      details: orphanedCompanyRelations.rows.length > 0 ? orphanedCompanyRelations.rows : undefined
    });
    
    // Test 3: All user_companies.tenant_id references exist in tenants table
    const orphanedTenantRelations = await nile.db.query(`
      SELECT uc.id, uc.user_id, uc.tenant_id, uc.company_id
      FROM user_companies uc
      LEFT JOIN tenants t ON uc.tenant_id = t.id
      WHERE t.id IS NULL
    `);
    
    results.push({
      test: 'User-Company Tenant References',
      status: orphanedTenantRelations.rows.length === 0 ? 'PASS' : 'FAIL',
      message: orphanedTenantRelations.rows.length === 0
        ? 'All user_companies records reference valid tenants'
        : `Found ${orphanedTenantRelations.rows.length} user_companies records with invalid tenant_id references`,
      details: orphanedTenantRelations.rows.length > 0 ? orphanedTenantRelations.rows : undefined
    });
    
  } catch (error) {
    results.push({
      test: 'User-Company Relationships',
      status: 'FAIL',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return results;
}

/**
 * Validate company-tenant relationships
 */
async function validateCompanyTenantRelationships(): Promise<ValidationResult[]> {
  const nile = getNileClient();
  const results: ValidationResult[] = [];
  
  try {
    // Test 1: All companies.tenant_id references exist in tenants table
    const orphanedCompanies = await nile.db.query(`
      SELECT c.id, c.tenant_id, c.name
      FROM companies c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE t.id IS NULL
    `);
    
    results.push({
      test: 'Company-Tenant References',
      status: orphanedCompanies.rows.length === 0 ? 'PASS' : 'FAIL',
      message: orphanedCompanies.rows.length === 0
        ? 'All companies reference valid tenants'
        : `Found ${orphanedCompanies.rows.length} companies with invalid tenant_id references`,
      details: orphanedCompanies.rows.length > 0 ? orphanedCompanies.rows : undefined
    });
    
    // Test 2: Check for tenants without companies
    const tenantsWithoutCompanies = await nile.db.query(`
      SELECT t.id, t.name, COUNT(c.id) as company_count
      FROM tenants t
      LEFT JOIN companies c ON t.id = c.tenant_id
      GROUP BY t.id, t.name
      HAVING COUNT(c.id) = 0
    `);
    
    results.push({
      test: 'Tenants Without Companies',
      status: 'WARN',
      message: `Found ${tenantsWithoutCompanies.rows.length} tenants without companies (this may be normal for new tenants)`,
      details: tenantsWithoutCompanies.rows
    });
    
  } catch (error) {
    results.push({
      test: 'Company-Tenant Relationships',
      status: 'FAIL',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return results;
}

/**
 * Validate data consistency
 */
async function validateDataConsistency(): Promise<ValidationResult[]> {
  const nile = getNileClient();
  const results: ValidationResult[] = [];
  
  try {
    // Test 1: Check for duplicate user emails
    const duplicateEmails = await nile.db.query(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);
    
    results.push({
      test: 'Duplicate User Emails',
      status: duplicateEmails.rows.length === 0 ? 'PASS' : 'FAIL',
      message: duplicateEmails.rows.length === 0
        ? 'No duplicate user emails found'
        : `Found ${duplicateEmails.rows.length} duplicate email addresses`,
      details: duplicateEmails.rows.length > 0 ? duplicateEmails.rows : undefined
    });
    
    // Test 2: Check for users with invalid roles
    const invalidRoles = await nile.db.query(`
      SELECT id, email, role
      FROM users
      WHERE role NOT IN ('user', 'admin', 'super_admin') AND role IS NOT NULL
    `);
    
    results.push({
      test: 'Invalid User Roles',
      status: invalidRoles.rows.length === 0 ? 'PASS' : 'WARN',
      message: invalidRoles.rows.length === 0
        ? 'All user roles are valid'
        : `Found ${invalidRoles.rows.length} users with non-standard roles`,
      details: invalidRoles.rows.length > 0 ? invalidRoles.rows : undefined
    });
    
    // Test 3: Check for user_companies with invalid roles
    const invalidCompanyRoles = await nile.db.query(`
      SELECT id, user_id, company_id, role
      FROM user_companies
      WHERE role NOT IN ('member', 'admin', 'owner') AND role IS NOT NULL
    `);
    
    results.push({
      test: 'Invalid User-Company Roles',
      status: invalidCompanyRoles.rows.length === 0 ? 'PASS' : 'WARN',
      message: invalidCompanyRoles.rows.length === 0
        ? 'All user-company roles are valid'
        : `Found ${invalidCompanyRoles.rows.length} user-company relationships with non-standard roles`,
      details: invalidCompanyRoles.rows.length > 0 ? invalidCompanyRoles.rows : undefined
    });
    
    // Test 4: Check for companies without names
    const companiesWithoutNames = await nile.db.query(`
      SELECT id, tenant_id, name
      FROM companies
      WHERE name IS NULL OR trim(name) = ''
    `);
    
    results.push({
      test: 'Companies Without Names',
      status: companiesWithoutNames.rows.length === 0 ? 'PASS' : 'FAIL',
      message: companiesWithoutNames.rows.length === 0
        ? 'All companies have valid names'
        : `Found ${companiesWithoutNames.rows.length} companies without names`,
      details: companiesWithoutNames.rows.length > 0 ? companiesWithoutNames.rows : undefined
    });
    
  } catch (error) {
    results.push({
      test: 'Data Consistency',
      status: 'FAIL',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return results;
}

/**
 * Validate tenant isolation
 */
async function validateTenantIsolation(): Promise<ValidationResult[]> {
  const nile = getNileClient();
  const results: ValidationResult[] = [];
  
  try {
    // Test 1: Check that all tenant-scoped tables have proper tenant_id
    const tablesWithTenantId = ['companies', 'user_companies'];
    
    for (const tableName of tablesWithTenantId) {
      const recordsWithoutTenant = await nile.db.query(`
        SELECT COUNT(*) as count
        FROM ${tableName}
        WHERE tenant_id IS NULL
      `);
      
      results.push({
        test: `${tableName} Tenant Isolation`,
        status: parseInt(recordsWithoutTenant.rows[0].count) === 0 ? 'PASS' : 'FAIL',
        message: parseInt(recordsWithoutTenant.rows[0].count) === 0
          ? `All ${tableName} records have valid tenant_id`
          : `Found ${recordsWithoutTenant.rows[0].count} ${tableName} records without tenant_id`,
      });
    }
    
    // Test 2: Check for cross-tenant data leakage in user_companies
    const crossTenantLeakage = await nile.db.query(`
      SELECT uc.id, uc.tenant_id as uc_tenant, c.tenant_id as c_tenant
      FROM user_companies uc
      JOIN companies c ON uc.company_id = c.id
      WHERE uc.tenant_id != c.tenant_id
    `);
    
    results.push({
      test: 'Cross-Tenant Data Leakage',
      status: crossTenantLeakage.rows.length === 0 ? 'PASS' : 'FAIL',
      message: crossTenantLeakage.rows.length === 0
        ? 'No cross-tenant data leakage detected'
        : `Found ${crossTenantLeakage.rows.length} user-company relationships with mismatched tenant_ids`,
      details: crossTenantLeakage.rows.length > 0 ? crossTenantLeakage.rows : undefined
    });
    
  } catch (error) {
    results.push({
      test: 'Tenant Isolation',
      status: 'FAIL',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return results;
}

/**
 * Get database statistics
 */
async function getDatabaseStatistics(): Promise<Record<string, unknown>> {
  const nile = getNileClient();
  
  try {
    const stats = {
      users: 0,
      tenants: 0,
      companies: 0,
      userCompanies: 0,
      staffUsers: 0,
      activeUsers: 0,
    };
    
    // Get table counts
    const userCount = await nile.db.query('SELECT COUNT(*) as count FROM users');
    stats.users = parseInt(userCount.rows[0].count);
    
    const tenantCount = await nile.db.query('SELECT COUNT(*) as count FROM tenants');
    stats.tenants = parseInt(tenantCount.rows[0].count);
    
    const companyCount = await nile.db.query('SELECT COUNT(*) as count FROM companies');
    stats.companies = parseInt(companyCount.rows[0].count);
    
    const userCompanyCount = await nile.db.query('SELECT COUNT(*) as count FROM user_companies');
    stats.userCompanies = parseInt(userCompanyCount.rows[0].count);
    
    // Get staff user count
    const staffCount = await nile.db.query('SELECT COUNT(*) as count FROM users WHERE is_penguinmails_staff = true');
    stats.staffUsers = parseInt(staffCount.rows[0].count);
    
    // Get active users (users with company relationships)
    const activeUserCount = await nile.db.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_companies
    `);
    stats.activeUsers = parseInt(activeUserCount.rows[0].count);
    
    return stats;
    
  } catch (error) {
    console.error('Failed to get database statistics:', error);
    return {};
  }
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('🔍 NileDB Data Integrity Validation\n');
  console.log('===================================\n');
  
  try {
    // Get database statistics
    console.log('📊 Database Statistics:');
    const stats = await getDatabaseStatistics();
    Object.entries(stats).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`   ${label}: ${value}`);
    });
    console.log();
    
    // Run all validation tests
    const allResults: ValidationResult[] = [];
    
    console.log('🔗 Validating User-Company Relationships...');
    const userCompanyResults = await validateUserCompanyRelationships();
    allResults.push(...userCompanyResults);
    
    console.log('🏢 Validating Company-Tenant Relationships...');
    const companyTenantResults = await validateCompanyTenantRelationships();
    allResults.push(...companyTenantResults);
    
    console.log('📋 Validating Data Consistency...');
    const consistencyResults = await validateDataConsistency();
    allResults.push(...consistencyResults);
    
    console.log('🔒 Validating Tenant Isolation...');
    const isolationResults = await validateTenantIsolation();
    allResults.push(...isolationResults);
    
    // Display results
    console.log('\n📋 Validation Results:');
    console.log('======================\n');
    
    const passCount = allResults.filter(r => r.status === 'PASS').length;
    const failCount = allResults.filter(r => r.status === 'FAIL').length;
    const warnCount = allResults.filter(r => r.status === 'WARN').length;
    
    allResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        console.log('   Details:', JSON.stringify(result.details, null, 2));
      }
    });
    
    console.log('\n📊 Summary:');
    console.log('===========');
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⚠️  Warnings: ${warnCount}`);
    console.log(`📋 Total Tests: ${allResults.length}`);
    
    if (failCount === 0) {
      console.log('\n🎉 All critical validations passed! Data integrity is maintained.');
    } else {
      console.log('\n🚨 Some validations failed. Please review the issues above.');
    }
    
    if (warnCount > 0) {
      console.log('💡 Warnings indicate potential issues that may need attention.');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export {
  validateUserCompanyRelationships,
  validateCompanyTenantRelationships,
  validateDataConsistency,
  validateTenantIsolation,
  getDatabaseStatistics,
};
