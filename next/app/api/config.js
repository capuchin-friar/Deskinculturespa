// lib/axios.js

import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/admin/",
    withCredentials: true,
    headers: {
        Cookie: "admin_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJha3B1bHVmYWJpYW5AZ21haWwuY29tIiwibmFtZSI6IkFrcHVsdSBGYWJpYW4ifQ.1xDUorMOsEs6HYnDLZwOvvJrTax00bCzdWilOr01eIU; Path=/; Expires=Wed, 06 Sep 2027 16:52:47 GMT;",
    },
});



export default api;