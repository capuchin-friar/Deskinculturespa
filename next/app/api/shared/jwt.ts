import jwt from "jsonwebtoken";

function readProcessEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

export function getJwtSecret(value?: string | null): string {
  const trimmed = (typeof value === "string" ? value : "").trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function getAdminJwtSecret(): string {
  return getJwtSecret(
    readProcessEnv("ADMIN_JWT_SECRET") ||
      readProcessEnv("CUSTOMER_JWT_SECRET") ||
      readProcessEnv("JWT_SECRET"),
  );
}

export function decodeAdminId(token: string): number {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
    throw new Error("Invalid authentication token");
  }

  const id = decoded.id;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) {
    throw new Error("Invalid authentication token");
  }

  return numericId;
}

export function decodeAdminPayload(token: string): { id: number } {
  return { id: decodeAdminId(token) };
}

export function decodeUserId(token: string): string | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) return null;

  const id = decoded.id;
  if ((typeof id !== "string" && typeof id !== "number") || String(id).trim() === "") {
    return null;
  }

  return String(id);
}
