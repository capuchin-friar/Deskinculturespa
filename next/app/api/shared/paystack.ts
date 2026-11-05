import { createHmac } from "node:crypto";

export function generatePaystackSignature(
  payload: string | Buffer,
  secret: string,
): string {
  return createHmac("sha512", secret).update(payload).digest("hex");
}

export function getPaystackSecret(): string {
  return String(process.env.PAYSTACK_SECRET_KEY || process.env.paystack_secret_key || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/^Bearer\s+/i, "");
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = getPaystackSecret();
  if (!secret) {
    throw new Error("Missing Paystack secret");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: Record<string, unknown>;
  } | null;

  if (!response.ok) {
    const detail = payload?.message ? `: ${payload.message}` : "";
    throw new Error(`Paystack verification failed with status ${response.status}${detail}`);
  }

  return payload || { status: false, message: "Empty Paystack response" };
}
