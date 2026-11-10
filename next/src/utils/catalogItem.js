import { api } from "@/app/api/shared/config";
import { extractCloudinaryPublicId } from "@/src/components/admin/AdminMediaBackdrop";

export function catalogCreatePath(type) {
    if (type === "appointment") return "appointment";
    if (type === "packages") return "package";
    if (type === "services") return "service";
    return "product";
}

export async function fetchAdminCatalogItem(path, id) {
    if (id == null || String(id).trim() === "") return null;
    const { data } = await api.get(path);
    const list = Array.isArray(data?.data) ? data.data : [];
    return (
        list.find((row) => String(row?.id ?? row?.product_id) === String(id)) ??
        null
    );
}

export function toMediaItem(url) {
    if (typeof url !== "string" || !url.trim()) return null;
    const trimmed = url.trim();
    return {
        url: trimmed,
        publicId: extractCloudinaryPublicId(trimmed),
        name: trimmed.split("/").pop() || "image",
    };
}

export function toMediaList(value) {
    let list = value;
    if (typeof list === "string") {
        try {
            list = JSON.parse(list);
        } catch {
            list = [list];
        }
    }
    const candidates = Array.isArray(list) ? list : [list];
    return candidates
        .map((entry) => {
            if (typeof entry === "string") return toMediaItem(entry);
            if (entry && typeof entry === "object" && typeof entry.url === "string") {
                return {
                    url: entry.url,
                    publicId:
                        entry.publicId || extractCloudinaryPublicId(entry.url),
                    name: entry.name || entry.url.split("/").pop() || "image",
                };
            }
            return null;
        })
        .filter(Boolean);
}

export function appointmentFormMode(dbMode) {
    const mode = String(dbMode || "").toLowerCase();
    if (mode === "physical" || mode === "in-person" || mode === "inperson") {
        return "physical";
    }
    if (mode === "audio" || mode === "phone") return "phone";
    return "online";
}

export function slugToTitle(slug) {
    return String(slug || "")
        .replace(/[-_]+/g, " ")
        .trim();
}
