import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql: postgres.Sql };

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return postgres(databaseUrl, { max: 5 });
}

export const sql = globalForDb.sql ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}
