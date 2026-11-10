"use client";

import { api, baseApi } from "@/app/api/shared/config";

let pending = 0;
let label = "Please wait";
const listeners = new Set();
let interceptorsAttached = false;
let fetchPatched = false;

function notify() {
    const busy = pending > 0;
    listeners.forEach((listener) => listener({ busy, label }));
}

export function subscribeProcessBusy(listener) {
    listeners.add(listener);
    listener({ busy: pending > 0, label });
    return () => listeners.delete(listener);
}

export function beginProcess(nextLabel = "Please wait") {
    pending += 1;
    label = nextLabel || "Please wait";
    notify();
}

export function endProcess() {
    pending = Math.max(0, pending - 1);
    if (pending === 0) label = "Please wait";
    notify();
}

function isMutating(method) {
    const verb = String(method || "GET").toUpperCase();
    return verb !== "GET" && verb !== "HEAD" && verb !== "OPTIONS";
}

function requestUrl(configOrInput, init) {
    if (configOrInput && typeof configOrInput === "object" && "url" in configOrInput && "baseURL" in configOrInput) {
        return `${configOrInput.baseURL || ""}${configOrInput.url || ""}`;
    }
    if (typeof configOrInput === "string") return configOrInput;
    if (typeof Request !== "undefined" && configOrInput instanceof Request) return configOrInput.url;
    if (configOrInput && typeof configOrInput === "object") return String(configOrInput.url || "");
    return String(init?.url || "");
}

function isMediaOnlyRequest(url) {
    const path = String(url || "").split("?")[0].replace(/\/+$/, "");
    if (/(^|\/)upload$/.test(path)) return true;
    if (path === "delete") return true;
    if (/(^|\/)admin\/delete$/.test(path)) return true;
    return false;
}

function shouldTrack(method, url) {
    if (!isMutating(method)) return false;
    if (String(url || "").includes("/_next/")) return false;
    if (isMediaOnlyRequest(url)) return false;
    return true;
}

function labelFor(method, url) {
    const path = String(url || "").toLowerCase();
    const verb = String(method || "").toUpperCase();
    if (path.includes("schedule") || path.includes("pay")) return "Processing";
    if (verb === "DELETE" || path.includes("delete")) return "Removing";
    if (verb === "PUT" || verb === "PATCH") return "Updating";
    if (verb === "POST") return "Saving";
    return "Please wait";
}

function attachAxios(client) {
    client.interceptors.request.use((config) => {
        if (config?.skipProcessBackdrop) return config;
        const url = requestUrl(config);
        if (shouldTrack(config.method, url)) {
            beginProcess(labelFor(config.method, url));
            config.__processBusy = true;
        }
        return config;
    });

    const settle = (value, isError) => {
        const config = isError ? value?.config : value?.config;
        if (config?.__processBusy) endProcess();
        if (isError) return Promise.reject(value);
        return value;
    };

    client.interceptors.response.use(
        (response) => settle(response, false),
        (error) => settle(error, true),
    );
}

function patchFetch() {
    if (typeof window === "undefined" || fetchPatched) return;
    fetchPatched = true;
    const original = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
        const url = requestUrl(input, init);
        const method =
            init.method ||
            (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET");
        const track = !init.skipProcessBackdrop && shouldTrack(method, url);
        if (track) beginProcess(labelFor(method, url));
        try {
            return await original(input, init);
        } finally {
            if (track) endProcess();
        }
    };
}

export function attachProcessBusyInterceptors() {
    if (typeof window === "undefined") return;
    patchFetch();
    if (interceptorsAttached) return;
    interceptorsAttached = true;
    attachAxios(api);
    attachAxios(baseApi);
}
