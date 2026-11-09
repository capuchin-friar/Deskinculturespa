"use client";

import { api } from "@/app/api/shared/config";

export function extractCloudinaryPublicId(url) {
    if (typeof url !== "string" || !url.trim()) return null;
    try {
        const pathname = new URL(url).pathname;
        const uploadIndex = pathname.indexOf("/upload/");
        if (uploadIndex === -1) return null;
        return pathname
            .substring(uploadIndex + "/upload/".length)
            .replace(/^v\d+\//, "")
            .replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
}

export async function deleteCloudinaryImage(publicId) {
    if (!publicId) {
        throw new Error("Image public ID is required.");
    }

    const { data, status } = await api.delete("delete", {
        data: { publicId },
    });

    if (status !== 200 || !data?.success) {
        throw new Error(data?.error || "Failed to delete image.");
    }

    return data;
}

export default function AdminMediaBackdrop({ mode }) {
    if (!mode) return null;

    const label = mode === "delete" ? "Removing image" : "Uploading image";

    return (
        <div
            className="admin-media-backdrop"
            role="alertdialog"
            aria-modal="true"
            aria-busy="true"
            aria-label={label}
        >
            <span className="admin-media-backdrop__spinner" aria-hidden="true" />
            <p>{label}…</p>
        </div>
    );
}
