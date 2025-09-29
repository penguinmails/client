#!/usr/bin/env tsx

/**
 * NileDB Schema Inspection Script
 * 
 * This script examines NileDB's built-in tables and data structures,
 * compares them with the existing Drizzle schema, and documents
 * the data mapping requirements for migration.
 */

import { getNileClient, withTenantContext, withoutTenantContext } from '../lib/niledb/client';
import { validateDatabaseConnection, testQueryPerformance } from '../lib/niledb/health';

interface TableSchema {
  tableName: string;
  columns: Array<{
    columnName: string;
    dataType: string;
    isNullable: string;
    columnDefault: string | null;
    characterMaximumLength: number | null;
  }>;
  indexes: Array<{
    indexName: string;
    columnName: string;
    isUnique: boolean;
  }>;
  constraints: Array<{
    constraintName: string;
    constraintType: string;
    columnName: string;
  }>;
}

interface DataSample {
  tableName: string;
  rowCount: number;
  sampleData: Record<string, unknown>[];
}

/**
 * Get detailed schema information for a table
 */
async function getTableSchema(tableName: string): Promise<TableSchema> {
  const nile = getNileClient();
  
  // Get column information
  const columnsQuery = `
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
  `;
  
  const columnsResult = await nile.db.query(columnsQuery, [tableName]);
  
  // Get index information
  const indexesQuery = `
    SELECT 
      i.relname as index_name,
      a.attname as column_name,
      ix.indisunique as is_unique
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relname = $1
    AND t.relkind = 'r'
    ORDER BY i.relname, a.attname
  `;
  
  const indexesResult = await nile.db.query(indexesQuery, [tableName]);
  
  // Get constraint information
  const constraintsQuery = `
    SELECT 
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = $1
    AND tc.table_schema = 'public'
    ORDER BY tc.constraint_name
  `;
  
  const constraintsResult = await nile.db.query(constraintsQuery, [tableName]);
  
  return {
    tableName,
    columns: columnsResult.rows.map((row: Record<string, unknown>) => ({
      columnName: row.column_name,
      dataType: row.data_type,
      isNullable: row.is_nullable,
      columnDefault: row.column_default,
      characterMaximumLength: row.character_maximum_length,
    })),
    indexes: indexesResult.rows.map((row: Record<string, unknown>) => ({
      indexName: row.index_name,
      columnName: row.column_name,
      isUnique: row.is_unique,
    })),
    constraints: constraintsResult.rows.map((row: Record<string, unknown>) => ({
      constraintName: row.constraint_name,
      constraintType: row.constraint_type,
      columnName: row.column_name,
    })),
  };
}

/**
 * Get sample data from a table
 */
async function getTableData(tableName: string, limit: number = 5): Promise<DataSample> {
  const nile = getNileClient();
  
  // Get row count
  const countResult = await nile.db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
  const rowCount = parseInt(countResult.rows[0].count);
  
  // Get sample data
  const sampleResult = await nile.db.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
  
  return {
    tableName,
    rowCount,
    sampleData: sampleResult.rows,
  };
}

/**
 * List all tables in the database
 */
async function listAllTables(): Promise<string[]> {
  const nile = getNileClient();
  
  const result = await nile.db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  return result.rows.map((row: Record<string, unknown>) => row.table_name);
}

/**
 * Check if NileDB built-in tables exist and examine their structure
 */
async function inspectNileBuiltinTables(): Promise<{
  users: TableSchema | null;
  tenants: TableSchema | null;
  tenantUsers: TableSchema | null;
}> {
  console.log('🔍 Inspecting NileDB built-in tables...\n');
  
  const tables = await listAllTables();
  console.log('📋 Available tables:', tables.join(', '));
  console.log();
  
  const result = {
    users: null as TableSchema | null,
    tenants: null as TableSchema | null,
    tenantUsers: null as TableSchema | null,
  };
  
  // Check for users table
  if (tables.includes('users')) {
    console.log('👤 Examining users table...');
    result.users = await getTableSchema('users');
    console.log(`   Columns: ${result.users.columns.length}`);
    console.log(`   Indexes: ${result.users.indexes.length}`);
    console.log(`   Constraints: ${result.users.constraints.length}`);
  } else {
    console.log('❌ users table not found');
  }
  
  // Check for tenants table
  if (tables.includes('tenants')) {
    console.log('🏢 Examining tenants table...');
    result.tenants = await getTableSchema('tenants');
    console.log(`   Columns: ${result.tenants.columns.length}`);
    console.log(`   Indexes: ${result.tenants.indexes.length}`);
    console.log(`   Constraints: ${result.tenants.constraints.length}`);
  } else {
    console.log('❌ tenants table not found');
  }
  
  // Check for tenant_users table (junction table)
  const tenantUserTables = tables.filter(t => 
    t.includes('tenant') && t.includes('user') || 
    t === 'tenant_users' || 
    t === 'user_tenants'
  );
  
  if (tenantUserTables.length > 0) {
    const tableName = tenantUserTables[0];
    console.log(`🔗 Examining ${tableName} table...`);
    result.tenantUsers = await getTableSchema(tableName);
    console.log(`   Columns: ${result.tenantUsers.columns.length}`);
    console.log(`   Indexes: ${result.tenantUsers.indexes.length}`);
    console.log(`   Constraints: ${result.tenantUsers.constraints.length}`);
  } else {
    console.log('❌ tenant-user junction table not found');
  }
  
  return result;
}

/**
 * Examine existing data in NileDB
 */
async function inspectExistingData(): Promise<{
  users: DataSample | null;
  tenants: DataSample | null;
  tenantUsers: DataSample | null;
  customTables: DataSample[];
}> {
  console.log('\n📊 Inspecting existing data...\n');
  
  const tables = await listAllTables();
  const result = {
    users: null as DataSample | null,
    tenants: null as DataSample | null,
    tenantUsers: null as DataSample | null,
    customTables: [] as DataSample[],
  };
  
  // Check users data
  if (tables.includes('users')) {
    result.users = await getTableData('users');
    console.log(`👤 Users table: ${result.users.rowCount} rows`);
  }
  
  // Check tenants data
  if (tables.includes('tenants')) {
    result.tenants = await getTableData('tenants');
    console.log(`🏢 Tenants table: ${result.tenants.rowCount} rows`);
  }
  
  // Check tenant-user junction data
  const tenantUserTables = tables.filter(t => 
    t.includes('tenant') && t.includes('user') || 
    t === 'tenant_users' || 
    t === 'user_tenants'
  );
  
  if (tenantUserTables.length > 0) {
    const tableName = tenantUserTables[0];
    result.tenantUsers = await getTableData(tableName);
    console.log(`🔗 ${tableName} table: ${result.tenantUsers.rowCount} rows`);
  }
  
  // Check for custom tables (not NileDB built-ins)
  const customTableNames = tables.filter(t => 
    !['users', 'tenants', 'tenant_users', 'user_tenants', 'migrations'].includes(t)
  );
  
  if (customTableNames.length > 0) {
    console.log(`\n📋 Found ${customTableNames.length} custom tables:`);
    for (const tableName of customTableNames) {
      const data = await getTableData(tableName);
      result.customTables.push(data);
      console.log(`   ${tableName}: ${data.rowCount} rows`);
    }
  }
  
  return result;
}

/**
 * Test tenant context functionality
 */
async function testTenantContext(): Promise<void> {
  console.log('\n🔄 Testing tenant context functionality...\n');
  
  try {
    // Test without tenant context
    const result1 = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query('SELECT current_setting(\'nile.tenant_id\', true) as tenant_id');
      return result.rows[0];
    });
    console.log('✅ Without tenant context:', result1);
    
    // Test with a dummy tenant context (this might fail if tenant doesn't exist)
    try {
      const result2 = await withTenantContext('test-tenant-id', async (nile) => {
        const result = await nile.db.query('SELECT current_setting(\'nile.tenant_id\', true) as tenant_id');
        return result.rows[0];
      });
      console.log('✅ With tenant context:', result2);
    } catch (error) {
      console.log('⚠️  Tenant context test failed (expected if no tenants exist):', 
        error instanceof Error ? error.message : 'Unknown error');
    }
    
  } catch (error) {
    console.log('❌ Tenant context test failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Generate data mapping documentation
 */
function generateDataMappingDoc(
  nileSchema: { users: TableSchema | null; tenants: TableSchema | null; tenantUsers: TableSchema | null },
  existingData: { users: DataSample | null; tenants: DataSample | null; tenantUsers: DataSample | null }
): string {
  let doc = `# NileDB Data Storage Patterns and Migration Mapping

## Investigation Summary

**Date:** ${new Date().toISOString()}
**Environment:** ${process.env.NODE_ENV || 'development'}

## NileDB Built-in Tables

`;

  // Users table documentation
  if (nileSchema.users) {
    doc += `### Users Table (NileDB Built-in)

**Schema:**
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
`;
    nileSchema.users.columns.forEach(col => {
      doc += `| ${col.columnName} | ${col.dataType} | ${col.isNullable} | ${col.columnDefault || 'NULL'} |\n`;
    });
    
    doc += `
**Indexes:**
`;
    nileSchema.users.indexes.forEach(idx => {
      doc += `- ${idx.indexName} on ${idx.columnName} ${idx.isUnique ? '(UNIQUE)' : ''}\n`;
    });
    
    doc += `
**Constraints:**
`;
    nileSchema.users.constraints.forEach(constraint => {
      doc += `- ${constraint.constraintName} (${constraint.constraintType}) on ${constraint.columnName}\n`;
    });
    
    if (existingData.users) {
      doc += `
**Existing Data:** ${existingData.users.rowCount} rows
`;
      if (existingData.users.sampleData.length > 0) {
        doc += `
**Sample Data:**
\`\`\`json
${JSON.stringify(existingData.users.sampleData, null, 2)}
\`\`\`
`;
      }
    }
  } else {
    doc += `### Users Table
❌ **Not found** - NileDB users table does not exist or is not accessible
`;
  }

  // Tenants table documentation
  if (nileSchema.tenants) {
    doc += `
### Tenants Table (NileDB Built-in)

**Schema:**
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
`;
    nileSchema.tenants.columns.forEach(col => {
      doc += `| ${col.columnName} | ${col.dataType} | ${col.isNullable} | ${col.columnDefault || 'NULL'} |\n`;
    });
    
    doc += `
**Indexes:**
`;
    nileSchema.tenants.indexes.forEach(idx => {
      doc += `- ${idx.indexName} on ${idx.columnName} ${idx.isUnique ? '(UNIQUE)' : ''}\n`;
    });
    
    if (existingData.tenants) {
      doc += `
**Existing Data:** ${existingData.tenants.rowCount} rows
`;
      if (existingData.tenants.sampleData.length > 0) {
        doc += `
**Sample Data:**
\`\`\`json
${JSON.stringify(existingData.tenants.sampleData, null, 2)}
\`\`\`
`;
      }
    }
  } else {
    doc += `
### Tenants Table
❌ **Not found** - NileDB tenants table does not exist or is not accessible
`;
  }

  // Tenant-User junction table
  if (nileSchema.tenantUsers) {
    doc += `
### Tenant-User Junction Table (NileDB Built-in)

**Table Name:** ${nileSchema.tenantUsers.tableName}

**Schema:**
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
`;
    nileSchema.tenantUsers.columns.forEach(col => {
      doc += `| ${col.columnName} | ${col.dataType} | ${col.isNullable} | ${col.columnDefault || 'NULL'} |\n`;
    });
    
    if (existingData.tenantUsers) {
      doc += `
**Existing Data:** ${existingData.tenantUsers.rowCount} rows
`;
    }
  } else {
    doc += `
### Tenant-User Junction Table
❌ **Not found** - NileDB tenant-user junction table does not exist or is not accessible
`;
  }

  // Migration mapping
  doc += `
## Migration Mapping

### Old Drizzle Schema → NileDB Schema

#### Users Table Migration
**Old Schema (custom users table):**
- id: UUID PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- name: VARCHAR(255)
- role: VARCHAR(50) DEFAULT 'user'
- is_penguinmails_staff: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

**NileDB Schema:**
${nileSchema.users ? `
- Uses NileDB's built-in users table
- Columns: ${nileSchema.users.columns.map(c => c.columnName).join(', ')}
- Additional profile data should be stored in a separate user_profiles table
` : '- NileDB users table not accessible - may need authentication setup'}

**Migration Strategy:**
${nileSchema.users ? `
1. Map existing user data to NileDB's built-in users table
2. Create user_profiles table for additional fields (role, is_penguinmails_staff)
3. Preserve user IDs if possible, or create mapping table
` : `
1. Set up NileDB authentication properly to access built-in users table
2. Investigate NileDB user management API
3. Create migration strategy once users table is accessible
`}

#### Tenants Table Migration
**Old Schema (custom companies table with tenant_id):**
- id: UUID
- tenant_id: UUID NOT NULL
- name: VARCHAR(255) NOT NULL
- email: VARCHAR(255)
- settings: JSONB DEFAULT '{}'
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

**NileDB Schema:**
${nileSchema.tenants ? `
- Uses NileDB's built-in tenants table
- Columns: ${nileSchema.tenants.columns.map(c => c.columnName).join(', ')}
- Companies become tenant-scoped business entities
` : '- NileDB tenants table not accessible - may need proper setup'}

**Migration Strategy:**
${nileSchema.tenants ? `
1. Map existing companies to NileDB tenants where appropriate
2. Create tenant-scoped companies table for business entities within tenants
3. Preserve company-tenant relationships
` : `
1. Set up NileDB tenant management properly
2. Investigate NileDB tenant API
3. Create migration strategy once tenants table is accessible
`}

#### User-Company Relationships Migration
**Old Schema (user_companies junction table):**
- id: UUID
- tenant_id: UUID NOT NULL
- user_id: UUID NOT NULL (references custom users table)
- company_id: UUID NOT NULL (references companies table)
- role: VARCHAR(50) DEFAULT 'member'
- permissions: JSONB DEFAULT '{}'

**NileDB Schema:**
${nileSchema.tenantUsers ? `
- Uses NileDB's built-in tenant-user relationships
- Table: ${nileSchema.tenantUsers.tableName}
- Columns: ${nileSchema.tenantUsers.columns.map(c => c.columnName).join(', ')}
` : '- NileDB tenant-user junction table not accessible'}

**Migration Strategy:**
${nileSchema.tenantUsers ? `
1. Use NileDB's built-in tenant membership for user-tenant relationships
2. Create separate user_company_roles table for company-specific roles within tenants
3. Preserve existing role and permission data
` : `
1. Investigate NileDB tenant membership API
2. Set up proper tenant-user relationship management
3. Create migration strategy once junction table is accessible
`}

## Recommendations

### Immediate Actions Required:
${!nileSchema.users || !nileSchema.tenants ? `
1. **🚨 Set up NileDB Authentication**: The built-in users and tenants tables are not accessible, indicating authentication is not properly configured
2. **Configure NileDB SDK**: Ensure the NileDB client is properly initialized with authentication
3. **Verify Environment Variables**: Check that all required NileDB environment variables are set correctly
` : `
1. **✅ NileDB tables are accessible**: Built-in users and tenants tables are available
2. **Plan data migration**: Create detailed migration scripts for existing data
3. **Set up tenant context**: Implement proper tenant isolation for all operations
`}

### Next Steps:
1. Create database service layer using NileDB's tenant-aware query interface
2. Implement authentication service using NileDB's built-in auth system
3. Create migration scripts to transfer existing data to NileDB schema
4. Set up proper tenant context management throughout the application
5. Create comprehensive testing for multi-tenant data isolation

## Data Integrity Considerations

### Existing Data Preservation:
- **Users**: ${existingData.users?.rowCount || 0} existing user records need migration
- **Tenants**: ${existingData.tenants?.rowCount || 0} existing tenant records need migration
- **Relationships**: ${existingData.tenantUsers?.rowCount || 0} existing relationships need migration

### Migration Risks:
1. **Data Loss**: Ensure all existing user and company data is preserved
2. **Relationship Integrity**: Maintain all user-company-tenant relationships
3. **Permission Preservation**: Keep all existing roles and permissions
4. **ID Mapping**: Handle potential ID conflicts between old and new systems

### Validation Requirements:
1. **Pre-migration**: Validate all existing data integrity
2. **During migration**: Implement transaction-based migration with rollback capability
3. **Post-migration**: Verify all data was migrated correctly and relationships are intact
`;

  return doc;
}

/**
 * Main inspection function
 */
async function main(): Promise<void> {
  console.log('🔍 NileDB Schema Investigation\n');
  console.log('=====================================\n');
  
  try {
    // Validate connection first
    console.log('🔌 Validating database connection...');
    const connectionResult = await validateDatabaseConnection();
    
    if (!connectionResult.isValid) {
      console.error('❌ Database connection failed:', connectionResult.error);
      console.log('\n📋 Connection Details:');
      console.log(`   Can Connect: ${connectionResult.details.canConnect}`);
      console.log(`   Can Authenticate: ${connectionResult.details.canAuthenticate}`);
      console.log(`   Can Query: ${connectionResult.details.canQuery}`);
      console.log(`   Response Time: ${connectionResult.details.responseTime}ms`);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log(`   Response Time: ${connectionResult.details.responseTime}ms\n`);
    
    // Test performance
    console.log('⚡ Testing query performance...');
    const perfResult = await testQueryPerformance();
    console.log(`   Average Response Time: ${perfResult.averageResponseTime}ms`);
    console.log(`   Successful Queries: ${perfResult.results.filter(r => r.success).length}/${perfResult.results.length}\n`);
    
    // Inspect NileDB built-in tables
    const nileSchema = await inspectNileBuiltinTables();
    
    // Inspect existing data
    const existingData = await inspectExistingData();
    
    // Test tenant context
    await testTenantContext();
    
    // Generate documentation
    console.log('\n📝 Generating data mapping documentation...');
    const mappingDoc = generateDataMappingDoc(nileSchema, existingData);
    
    // Write documentation to file
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const docPath = path.join(process.cwd(), 'lib', 'niledb', 'SCHEMA_INVESTIGATION.md');
    await fs.writeFile(docPath, mappingDoc, 'utf-8');
    
    console.log(`✅ Documentation written to: ${docPath}`);
    
    // Summary
    console.log('\n📊 Investigation Summary:');
    console.log('========================');
    console.log(`Users table: ${nileSchema.users ? '✅ Found' : '❌ Not found'}`);
    console.log(`Tenants table: ${nileSchema.tenants ? '✅ Found' : '❌ Not found'}`);
    console.log(`Tenant-User junction: ${nileSchema.tenantUsers ? '✅ Found' : '❌ Not found'}`);
    console.log(`Existing users: ${existingData.users?.rowCount || 0} rows`);
    console.log(`Existing tenants: ${existingData.tenants?.rowCount || 0} rows`);
    console.log(`Custom tables: ${existingData.customTables.length} found`);
    
    if (!nileSchema.users || !nileSchema.tenants) {
      console.log('\n⚠️  WARNING: NileDB built-in tables not accessible.');
      console.log('   This likely indicates authentication is not properly configured.');
      console.log('   Please check your NileDB setup and environment variables.');
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message.includes('configuration')) {
      console.log('\n💡 Configuration Help:');
      console.log('   Make sure these environment variables are set:');
      console.log('   - NILEDB_USER');
      console.log('   - NILEDB_PASSWORD');
      console.log('   - NILEDB_API_URL');
      console.log('   - NILEDB_POSTGRES_URL');
    }
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export {
  getTableSchema,
  getTableData,
  listAllTables,
  inspectNileBuiltinTables,
  inspectExistingData,
  testTenantContext,
  generateDataMappingDoc,
};
