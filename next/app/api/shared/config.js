import axios from "axios";

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

export function siteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return trimSlash(explicit);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${trimSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${trimSlash(process.env.VERCEL_URL)}`;
  }
  return "https://www.deskinculture.com";
}

export function absoluteUrl(path = "/") {
  const origin = siteOrigin();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL || "/api/admin/",
  withCredentials: true,
});

export const baseApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/",
  withCredentials: true,
});
