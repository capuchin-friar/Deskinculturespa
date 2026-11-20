export const CONSULTED_PARAM = "consulted";

export function isPaidConsultation(appointment) {
  const payment = String(appointment?.payment_status || "").toLowerCase();
  const status = String(appointment?.status || "").toLowerCase();
  return payment === "paid" || status === "completed";
}

export function servicesFromConsultationHref(appointmentId) {
  const id = encodeURIComponent(String(appointmentId ?? "").trim());
  return `/services?${CONSULTED_PARAM}=${id}`;
}

export function withConsultedParam(pathname, consultedId) {
  if (!consultedId) return pathname;
  return `${pathname}?${CONSULTED_PARAM}=${encodeURIComponent(consultedId)}`;
}

export function readConsultedParam(searchParams) {
  if (searchParams && typeof searchParams.get === "function") {
    return String(searchParams.get(CONSULTED_PARAM) || "").trim();
  }
  if (typeof window === "undefined") return "";
  return String(new URLSearchParams(window.location.search).get(CONSULTED_PARAM) || "").trim();
}
