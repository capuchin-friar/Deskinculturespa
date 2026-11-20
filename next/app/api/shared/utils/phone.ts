import { isRecord } from "./request";
import { query } from "../database";

export function normalizePhone(value: unknown) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (digits.length < 10) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return digits;
}

export function phoneFromUnknown(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return normalizePhone(value);
  }
  if (!isRecord(value)) return "";
  return (
    normalizePhone(value.phone) ||
    normalizePhone(value.customer_phone) ||
    normalizePhone(value.mobile) ||
    phoneFromUnknown(value.customer)
  );
}

export function phoneFromPaystack(data: unknown) {
  if (!isRecord(data)) return "";
  return (
    phoneFromUnknown(data.customer) ||
    phoneFromUnknown(data.metadata) ||
    normalizePhone(data.phone)
  );
}

export async function saveCustomerPhoneIfEmpty(userId: string | number, phone: unknown) {
  const normalized = normalizePhone(phone);
  if (!normalized || userId == null || userId === "") return;
  await query(
    `UPDATE users
     SET phone = $1
     WHERE id::text = $2::text
       AND (phone IS NULL OR BTRIM(phone::text) = '')`,
    [normalized, String(userId)],
  );
}
