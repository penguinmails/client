#!/usr/bin/env tsx

/**
 * Check Users Schema
 * 
 * This script checks the separate 'users' schema where NileDB
 * stores its built-in users and tenant_users tables.
 */

import { getNileClient } from '../lib/niledb/client';

interface CrossSchemaRow {
  user_id: string;
  email: string;
  tenant_id: string | null;
  tenant_name: string | null;
}

async function checkUsersSchema(): Promise<void> {
  console.log('👤 Checking NileDB Users Schema\n');
  console.log('===============================\n');
  
  const nile = getNileClient();
  
  try {
    // Check all schemas in the database
    console.log('📋 All Schemas in Database:');
    const schemas = await nile.db.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    
    schemas.rows.forEach((schema: { schema_name: string }) => {
      console.log(`   - ${schema.schema_name}`);
    });
    
    // Check tables in the 'users' schema specifically
    console.log('\n👤 Tables in "users" Schema:');
    const usersTables = await nile.db.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'users'
      ORDER BY table_name
    `);
    
    if (usersTables.rows.length > 0) {
      usersTables.rows.forEach((table: { table_name: string; table_type: string }) => {
        console.log(`   ✅ ${table.table_name} (${table.table_type})`);
      });
      
      // Examine the users table in users schema
      if (usersTables.rows.some((t: { table_name: string }) => t.table_name === 'users')) {
        console.log('\n📋 users.users Table Schema:');
        const usersSchema = await nile.db.query(`
          SELECT
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = 'users'
          AND table_schema = 'users'
          ORDER BY ordinal_position
        `);
        
        usersSchema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }) => {
          console.log(`     ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
        
        // Get users data
        const usersCount = await nile.db.query('SELECT COUNT(*) as count FROM users.users');
        console.log(`\n   Users count: ${usersCount.rows[0].count}`);
        
        if (parseInt(usersCount.rows[0].count) > 0) {
          const sampleUsers = await nile.db.query('SELECT * FROM users.users LIMIT 3');
          console.log('\n   Sample users:');
          sampleUsers.rows.forEach((user: unknown, index: number) => {
            console.log(`     User ${index + 1}:`, JSON.stringify(user, null, 2));
          });
        }
      }
      
      // Examine the tenant_users table
      if (usersTables.rows.some((t: { table_name: string }) => t.table_name === 'tenant_users')) {
        console.log('\n📋 users.tenant_users Table Schema:');
        const tenantUsersSchema = await nile.db.query(`
          SELECT
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = 'tenant_users'
          AND table_schema = 'users'
          ORDER BY ordinal_position
        `);
        
        tenantUsersSchema.rows.forEach((col: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }) => {
          console.log(`     ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
        
        // Get tenant_users data
        const tenantUsersCount = await nile.db.query('SELECT COUNT(*) as count FROM users.tenant_users');
        console.log(`\n   Tenant-users relationships: ${tenantUsersCount.rows[0].count}`);
        
        if (parseInt(tenantUsersCount.rows[0].count) > 0) {
          const sampleTenantUsers = await nile.db.query('SELECT * FROM users.tenant_users LIMIT 3');
          console.log('\n   Sample tenant-user relationships:');
          sampleTenantUsers.rows.forEach((rel: unknown, index: number) => {
            console.log(`     Relationship ${index + 1}:`, JSON.stringify(rel, null, 2));
          });
        }
      }
      
    } else {
      console.log('   ❌ No tables found in users schema');
    }
    
    // Check all tables across all schemas
    console.log('\n🔍 All Tables Across All Schemas:');
    const allTables = await nile.db.query(`
      SELECT 
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY table_schema, table_name
    `);
    
    const groupedTables = allTables.rows.reduce((acc: Record<string, string[]>, table: { table_schema: string; table_name: string; table_type: string }) => {
      if (!acc[table.table_schema]) {
        acc[table.table_schema] = [];
      }
      acc[table.table_schema].push(table.table_name);
      return acc;
    }, {} as Record<string, string[]>);
    
    for (const [schema, tables] of Object.entries(groupedTables) as [string, string[]][]) {
      console.log(`   ${schema}: ${tables.join(', ')}`);
    }
    
    // Test querying users with proper schema
    console.log('\n🔍 Testing Cross-Schema Queries:');
    try {
      // Try to query users from users schema
      const crossSchemaTest = await nile.db.query(`
        SELECT 
          u.id as user_id,
          u.email,
          tu.tenant_id,
          t.name as tenant_name
        FROM users.users u
        LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
        LEFT JOIN public.tenants t ON tu.tenant_id = t.id
        LIMIT 5
      `);
      
      console.log('   ✅ Cross-schema query successful');
      if (crossSchemaTest.rows.length > 0) {
        console.log('   Results:');
        crossSchemaTest.rows.forEach((row: CrossSchemaRow, index: number) => {
          console.log(`     ${index + 1}. ${row.email} → ${row.tenant_name || 'No tenant'}`);
        });
      } else {
        console.log('   No user-tenant relationships found');
      }
      
    } catch (error) {
      console.log('   ❌ Cross-schema query failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await checkUsersSchema();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { checkUsersSchema };
