// lib/axios.js

import axios from "axios";

function siteOrigin() {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (explicit) return explicit.replace(/\/+$/, "");

    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    if (vercel) return `https://${String(vercel).replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

    return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
    if (typeof path === "string" && /^https?:\/\//i.test(path)) return path;
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${siteOrigin()}${suffix}`;
}

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/admin/",
    withCredentials: true,
});

export const baseApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/",
    withCredentials: true,
});

