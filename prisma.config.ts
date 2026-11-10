import { defineConfig } from "prisma/config";

// Generate and validate the schema without connecting to a database. Commands
// that change a database must receive DATABASE_URL explicitly in their environment.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
