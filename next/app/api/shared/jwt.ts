import jwt from "jsonwebtoken";

/**
 * JWT secret normalization.
 * Must match the Node backend's getJwtSecret() so tokens signed here verify there.
 */

export function getJwtSecret(jwt: string): string {
  // const raw = process.env.JWT_SECRET ?? "";
  const trimmed = jwt.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
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
