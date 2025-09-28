#!/usr/bin/env npx tsx

/**
 * NileDB Configuration Validation Script
 * 
 * This script validates the NileDB configuration and tests the database connection.
 * It can be run in different environments to ensure proper setup.
 * 
 * Usage:
 *   npm run validate:niledb
 *   npx tsx scripts/validate-niledb-config.ts
 *   npx tsx scripts/validate-niledb-config.ts --env=staging
 */

import { validateConfiguration, performHealthCheck, testQueryPerformance } from '../lib/niledb/health';
import { testNileConnection, getClientInfo } from '../lib/niledb/client';
import { validateEnvironmentVariables } from '../lib/niledb/config';

interface ValidationOptions {
  env?: string;
  verbose?: boolean;
  skipConnection?: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  const options: ValidationOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--env=')) {
      options.env = arg.split('=')[1];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--skip-connection') {
      options.skipConnection = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
NileDB Configuration Validation Script

Usage:
  npx tsx scripts/validate-niledb-config.ts [options]

Options:
  --env=<environment>    Set environment (development, staging, production)
  --verbose, -v          Enable verbose output
  --skip-connection      Skip database connection tests
  --help, -h             Show this help message

Examples:
  npx tsx scripts/validate-niledb-config.ts
  npx tsx scripts/validate-niledb-config.ts --env=staging --verbose
  npx tsx scripts/validate-niledb-config.ts --skip-connection
      `);
      process.exit(0);
    }
  }

  // Set environment if specified
  if (options.env) {
    // Use environment variable override instead of modifying process.env directly
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: options.env,
      writable: true,
      configurable: true,
    });
    console.log(`🌍 Running validation for environment: ${options.env}`);
  }

  console.log('🔍 Validating NileDB Configuration...\n');

  let hasErrors = false;

  // Step 1: Validate environment variables
  console.log('1️⃣ Checking environment variables...');
  const envValidation = validateEnvironmentVariables();
  
  if (envValidation.isValid) {
    console.log('✅ All required environment variables are present');
  } else {
    console.log('❌ Missing required environment variables:');
    envValidation.missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    hasErrors = true;
  }

  if (options.verbose) {
    console.log('\n📋 Environment variables status:');
    const requiredVars = ['NILEDB_USER', 'NILEDB_PASSWORD', 'NILEDB_API_URL', 'NILEDB_POSTGRES_URL'];
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        // Mask sensitive values
        const maskedValue = varName.includes('PASSWORD') || varName.includes('TOKEN') 
          ? '*'.repeat(8) 
          : value.length > 50 
            ? value.substring(0, 20) + '...' + value.substring(value.length - 10)
            : value;
        console.log(`   ${varName}: ${maskedValue}`);
      } else {
        console.log(`   ${varName}: ❌ NOT SET`);
      }
    });
  }

  // Step 2: Validate configuration structure
  console.log('\n2️⃣ Validating configuration structure...');
  const configValidation = validateConfiguration();
  
  if (configValidation.isValid) {
    console.log('✅ Configuration structure is valid');
    
    if (options.verbose) {
      try {
        const clientInfo = getClientInfo();
        console.log('\n📊 Configuration details:');
        console.log(`   Database ID: ${clientInfo.databaseId}`);
        console.log(`   Database Name: ${clientInfo.databaseName}`);
        console.log(`   Environment: ${clientInfo.environment}`);
        console.log(`   Origin: ${clientInfo.origin}`);
        console.log(`   Debug Mode: ${clientInfo.debug}`);
        console.log(`   Secure Cookies: ${clientInfo.secureCookies}`);
      } catch {
        console.log('⚠️  Could not retrieve configuration details');
      }
    }
  } else {
    console.log('❌ Configuration validation failed:');
    configValidation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    hasErrors = true;
  }

  // Step 3: Test database connection (if not skipped)
  if (!options.skipConnection && !hasErrors) {
    console.log('\n3️⃣ Testing database connection...');
    
    try {
      const connectionTest = await testNileConnection();
      
      if (connectionTest.success) {
        console.log('✅ Database connection successful');
        
        if (options.verbose && connectionTest.details) {
          console.log(`   Query: ${connectionTest.details.query}`);
          console.log(`   Result: ${JSON.stringify(connectionTest.details.result)}`);
          console.log(`   Row Count: ${connectionTest.details.rowCount}`);
        }
      } else {
        console.log('❌ Database connection failed:');
        console.log(`   Error: ${connectionTest.error}`);
        hasErrors = true;
      }
    } catch (error) {
      console.log('❌ Database connection test failed:');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      hasErrors = true;
    }

    // Step 4: Comprehensive health check
    if (!hasErrors) {
      console.log('\n4️⃣ Running comprehensive health check...');
      
      try {
        const healthCheck = await performHealthCheck();
        
        console.log(`📊 Overall Status: ${healthCheck.status.toUpperCase()}`);
        console.log(`   Database: ${healthCheck.checks.database.status.toUpperCase()}`);
        console.log(`   API: ${healthCheck.checks.api.status.toUpperCase()}`);
        console.log(`   Authentication: ${healthCheck.checks.authentication.status.toUpperCase()}`);
        
        if (options.verbose) {
          console.log('\n📈 Health Check Details:');
          console.log(`   Timestamp: ${healthCheck.timestamp}`);
          console.log(`   Environment: ${healthCheck.metadata.environment}`);
          console.log(`   Uptime: ${Math.round(healthCheck.metadata.uptime)}s`);
          
          Object.entries(healthCheck.checks).forEach(([name, check]) => {
            console.log(`\n   ${name.toUpperCase()}:`);
            console.log(`     Status: ${check.status}`);
            if (check.responseTime) {
              console.log(`     Response Time: ${check.responseTime}ms`);
            }
            if (check.error) {
              console.log(`     Error: ${check.error}`);
            }
            if (check.details) {
              console.log(`     Details: ${JSON.stringify(check.details, null, 6)}`);
            }
          });
        }
        
        if (healthCheck.status === 'unhealthy') {
          hasErrors = true;
        }
      } catch (error) {
        console.log('❌ Health check failed:');
        console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        hasErrors = true;
      }
    }

    // Step 5: Performance test (verbose mode only)
    if (options.verbose && !hasErrors) {
      console.log('\n5️⃣ Running performance tests...');
      
      try {
        const perfTest = await testQueryPerformance();
        
        console.log(`📊 Average Response Time: ${Math.round(perfTest.averageResponseTime)}ms`);
        
        console.log('\n📈 Query Performance:');
        perfTest.results.forEach((result, index) => {
          const status = result.success ? '✅' : '❌';
          console.log(`   ${index + 1}. ${status} ${result.query}`);
          console.log(`      Response Time: ${result.responseTime}ms`);
          if (result.error) {
            console.log(`      Error: ${result.error}`);
          }
        });
      } catch (error) {
        console.log('⚠️  Performance test failed:');
        console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } else if (options.skipConnection) {
    console.log('\n3️⃣ Skipping database connection tests (--skip-connection flag)');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ VALIDATION FAILED');
    console.log('\nPlease fix the errors above before proceeding with the migration.');
    console.log('\nFor help with configuration, see:');
    console.log('  - .env.example for required environment variables');
    console.log('  - lib/niledb/config.ts for configuration options');
    console.log('  - NileDB documentation: https://docs.thenile.dev');
    process.exit(1);
  } else {
    console.log('✅ VALIDATION SUCCESSFUL');
    console.log('\nNileDB configuration is valid and ready for use!');
    
    if (!options.skipConnection) {
      console.log('\nNext steps:');
      console.log('  1. Run the migration scripts to migrate data');
      console.log('  2. Update your application code to use the new NileDB client');
      console.log('  3. Test your application thoroughly');
    }
    
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the validation
main().catch((error) => {
  console.error('\n❌ Validation script failed:', error.message);
  process.exit(1);
});
