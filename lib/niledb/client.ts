// lib/niledb/client.ts
import { Nile } from "@niledatabase/server";

if (!process.env.NILEDB_API_URL || !process.env.NILEDB_USER || !process.env.NILEDB_PASSWORD) {
  throw new Error("NILEDB_API_URL, NILEDB_USER, and NILEDB_PASSWORD must be defined");
}

export const nile = Nile({
  apiUrl: process.env.NILEDB_API_URL,
  user: process.env.NILEDB_USER,
  password: process.env.NILEDB_PASSWORD,
});
