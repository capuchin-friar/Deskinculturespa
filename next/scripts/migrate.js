const fs = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");

const MIGRATION_DIR = path.join(__dirname, "..", "app", "api", "migration");
const LOCK_ID = 4815162342;

async function run() {
  const client = new Client(
    process.env.DB_URL?.trim()
      ? { connectionString: process.env.DB_URL }
      : {
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
          host: process.env.DB_HOST || "localhost",
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME,
        }
  );

  await client.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows: applied } = await client.query(
      "SELECT filename FROM schema_migrations ORDER BY filename"
    );
    const appliedSet = new Set(applied.map((row) => row.filename));

    const files = (await fs.readdir(MIGRATION_DIR))
      .filter((file) => /^\\d+_.*\\.sql$/.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const filename of files) {
      if (appliedSet.has(filename)) continue;

      const sql = await fs.readFile(path.join(MIGRATION_DIR, filename), "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
        await client.query("COMMIT");
        console.log(`[migration] applied ${filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${filename} failed: ${error.message}`);
      }
    }

    console.log("[migration] database is up to date");
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    await client.end();
  }
}

run().catch((error) => {
  console.error("[migration] failed", error);
  process.exitCode = 1;
});
