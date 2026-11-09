"use client";

export const CREATE_DRAFT_KEYS = {
    product: "deskinculture_create_product_draft",
    service: "deskinculture_create_service_draft",
    package: "deskinculture_create_package_draft",
    appointment: "deskinculture_create_appointment_draft",
};

export function loadCreateDraft(key) {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
        console.error("Failed to restore create draft:", error);
        return null;
    }
}

export function saveCreateDraft(key, draft) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(draft));
    } catch (error) {
        console.error("Failed to save create draft:", error);
    }
}

export function clearCreateDraft(key) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.error("Failed to clear create draft:", error);
    }
}
