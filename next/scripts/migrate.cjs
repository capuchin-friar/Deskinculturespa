#!/usr/bin/env node

const { createHash } = require("node:crypto");
const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const { loadEnvConfig } = require("@next/env");
const { Pool } = require("pg");

loadEnvConfig(process.cwd());

const migrationDirectory = path.join(process.cwd(), "app", "api", "migration");
const lockKey = [72631, 1];

function getPoolConfig() {
  const max = Number(process.env.DB_POOL_MAX ?? 10);
  if (!Number.isInteger(max) || max < 1) {
    throw new Error("DB_POOL_MAX must be a positive integer");
  }

  if (process.env.DB_URL?.trim()) {
    return {
      connectionString: process.env.DB_URL.trim(),
      max,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    };
  }

  const port = Number.parseInt(process.env.DB_PORT || "5432", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT must be a valid TCP port");
  }

  return {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port,
    database: process.env.DB_NAME,
    max,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };
}

function migrationNumber(filename) {
  return Number.parseInt(filename.split("_", 1)[0], 10);
}

async function getMigrations() {
  const filenames = (await readdir(migrationDirectory))
    .filter((filename) => /^\d+_.+\.sql$/i.test(filename))
    .sort((left, right) => migrationNumber(left) - migrationNumber(right) || left.localeCompare(right));

  if (filenames.length === 0) {
    throw new Error(`No numbered SQL migration files found in ${migrationDirectory}`);
  }

  return Promise.all(
    filenames.map(async (filename) => {
      const sql = await readFile(path.join(migrationDirectory, filename), "utf8");
      return {
        filename,
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
}

async function runMigrations() {
  const pool = new Pool(getPoolConfig());
  const client = await pool.connect();
  let lockAcquired = false;

  try {
    await client.query("SELECT pg_advisory_lock($1, $2)", lockKey);
    lockAcquired = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrations = await getMigrations();
    let appliedCount = 0;

    for (const migration of migrations) {
      const existing = await client.query(
        "SELECT checksum FROM schema_migrations WHERE filename = $1",
        [migration.filename],
      );

      if (existing.rowCount > 0) {
        if (existing.rows[0].checksum.trim() !== migration.checksum) {
          throw new Error(
            `Migration ${migration.filename} has changed since it was applied. ` +
              "Create a new migration instead of editing an applied migration.",
          );
        }
        console.log(`Already applied: ${migration.filename}`);
        continue;
      }

      console.log(`Applying: ${migration.filename}`);
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query(
          "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
          [migration.filename, migration.checksum],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
      appliedCount += 1;
    }

    console.log(`Migration run complete. Applied ${appliedCount} migration(s).`);
  } finally {
    if (lockAcquired) {
      try {
        await client.query("SELECT pg_advisory_unlock($1, $2)", lockKey);
      } catch (error) {
        console.error("Could not release the migration lock:", error.message);
      }
    }
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
