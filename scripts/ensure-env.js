#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envLocalPath = path.join(__dirname, "..", ".env.local");

try {
  // Read existing .env.local
  let envContent = fs.readFileSync(envLocalPath, "utf-8");

  // Update values based on docker-compose.yml for LOCAL development
  const updates = {
    "NILEDB_USER=.*": "NILEDB_USER=00000000-0000-7000-8000-000000000000",
    "NILEDB_PASSWORD=.*": "NILEDB_PASSWORD=password",
    "NILEDB_API_URL=.*": "NILEDB_API_URL=https://us-west-2.api.thenile.dev",
    "NILEDB_POSTGRES_URL=.*":
      "NILEDB_POSTGRES_URL=postgres://00000000-0000-7000-8000-000000000000:password@localhost:5443/oltp",
    "REDIS_URL=.*": "REDIS_URL=redis://localhost:6380",
  };

  // Apply all replacements
  Object.entries(updates).forEach(([pattern, replacement]) => {
    envContent = envContent.replace(new RegExp(pattern), replacement);
  });

  fs.writeFileSync(envLocalPath, envContent);
  console.log(
    "✓ .env.local updated with local Docker testing container values",
  );
} catch (error) {
  console.error("✗ Failed to update .env.local:", error.message);
  process.exit(1);
}
