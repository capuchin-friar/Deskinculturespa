import _CONSULTATIONS from "@/src/json/consultations.json";

export const APPOINTMENT_TYPES = _CONSULTATIONS.map(({ id, name, description }) => ({
    id,
    name,
    description: description || "",
}));

export function resolveAppointmentType(value) {
    const raw = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-");
    if (!raw) return null;
    const exact = APPOINTMENT_TYPES.find(
        (type) =>
            type.id === raw ||
            type.name.toLowerCase().replace(/[\s_]+/g, "-") === raw
    );
    if (exact) return exact;
    if (raw.includes("body")) {
        return APPOINTMENT_TYPES.find((type) => type.id === "body") || null;
    }
    if (raw.includes("skin")) {
        return APPOINTMENT_TYPES.find((type) => type.id === "skincare") || null;
    }
    return null;
}

export function appointmentTypeName(value) {
    return resolveAppointmentType(value)?.name || "";
}
