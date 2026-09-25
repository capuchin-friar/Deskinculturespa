const PAYSTACK_API_URL = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

async function paystackRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || `Paystack request failed with status ${response.status}`);
  }

  return payload.data as T;
}

export type PaystackTransaction = {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  gateway_response?: string;
  paid_at?: string | null;
  created_at?: string;
  customer?: { email?: string };
  authorization?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  orderId: number;
  orderType: "product" | "service" | "appointment";
}) {
  return paystackRequest<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      currency: "NGN",
      reference: input.reference,
      callback_url: process.env.PAYSTACK_CALLBACK_URL || undefined,
      metadata: {
        order_id: input.orderId,
        order_type: input.orderType,
      },
    }),
  });
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" },
  );
}
