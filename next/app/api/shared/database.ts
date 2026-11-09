import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type SqlParameter =
  | string
  | number
  | boolean
  | Date
  | Buffer
  | null
  | undefined
  | JsonValue;

let pool: Pool | null = null;

function databaseUrl() {
  return (
    process.env.DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ""
  );
}

function poolFromUrl(connectionString: string, max: number) {
  const url = new URL(connectionString);
  return new Pool({
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    database: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
    ssl: { rejectUnauthorized: true },
    max,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

function getPool(): Pool {
  if (pool) return pool;

  const max = Number(process.env.DB_POOL_MAX ?? 10);
  const connectionString = databaseUrl();

  pool = connectionString
    ? poolFromUrl(connectionString, max)
    : new Pool({
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME,
        max,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      });

  return pool;
}

export async function db(): Promise<PoolClient> {
  const client = await getPool().connect();
  return client;
}

export async function query<Row extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: SqlParameter[],
): Promise<QueryResult<Row>> {
  return getPool().query<Row>(text, params);
}

export { getPool };
