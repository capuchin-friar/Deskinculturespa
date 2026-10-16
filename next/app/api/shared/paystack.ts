import { createHmac } from "node:crypto";

export function generatePaystackSignature(
  payload: string | Buffer,
  secret: string,
): string {
  return createHmac("sha512", secret).update(payload).digest("hex");
}
