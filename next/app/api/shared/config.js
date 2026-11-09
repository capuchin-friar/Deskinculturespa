// lib/axios.js

import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/admin/",
    withCredentials: true,
});

export const baseApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/",
    withCredentials: true,
});

