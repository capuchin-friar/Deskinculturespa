"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import "./styles/xxl.css"
import "./styles/s.css"
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";
import { api } from "../../api/shared/config"
import AdminLoader from "@/src/components/admin/AdminLoader"


function jsAgo(value) {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 10) return "just now"
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    const years = Math.floor(days / 365)
    return `${years}y ago`
}

export default function InventoryPage() {
    const dispatch = useDispatch()
    const [data, setData] = useState([])
    const [rows, setRows] = useState([])
    const [role, setRole] = useState("customer")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        (async () => {
            setLoading(true)
            setError("")
            try {
                const { data: users } = await api.get("/users");
                
                setData(Array.isArray(users.data) ? users.data : [])
                setLoading(false);
            } catch (e) {
                setRows([])
                setError(e?.message || "Could not load Users.")
                setLoading(false);
            } finally {
            }
        })()

        return () => {
            // cancelled = true
        }
    }, []);

    useEffect(() => {
        setRows(Array.isArray(data) ? data.filter(u => String(u.role || "").toLowerCase() === role.toLowerCase()) : [])
    }, [role, data])

    function formatLocation(obj){
        if (!obj) return "—";
        let location = obj;
        if (typeof location === "string") {
            try {
                location = JSON.parse(location);
            } catch {
                return location;
            }
        }
        const city = location?.city;
        const state = location?.state;
        if (!city && !state) return "—";
        if (city && state) return `${city}, ${state}`;
        return city || state;
    }


    return (
        <div className="inventory-page">
            <div className="inventory-header">
                <h5>Users</h5>
                {["customer", "admin"].length > 0 ? (
                    <div className="inventory-shop-select">
                        <select
                            id="users-role"
                            aria-label="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            {[
                                { name: "Customer", value: "customer" },
                                { name: "Admin", value: "admin" },
                            ].map(({ name, value }) => (
                                <option key={value} value={value}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
            </div>

            {loading ? <AdminLoader label="Loading users" /> : null}
            {!loading && error ? <p style={{ color: "#c00" }}>{error}</p> : null}

            <div className="inventory-table-wrap">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            {/* Pending columns to be added in the future */}
                            {/* <th>order</th>
                <th>total spent</th> */}
                            <th>Location</th>
                            <th>Joined</th>
                            {/* <th>actions</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && rows.length === 0 ? (
                            <tr>
                                <td className="inventory-empty" colSpan={6}>
                                    No {role}s yet.
                                </td>
                            </tr>
                        ) : null}
                        {!loading &&
                            rows.map((r, index) => {
                                const name = [r?.fname, r?.lname].filter(Boolean).join(" ").trim();
                                return (
                                <tr key={r?.id ?? index}>
                                    <td className="inventory-id">{r?.id ?? "—"}</td>
                                    <td className="inventory-name">{name || "—"}</td>
                                    <td>{r?.email ?? "—"}</td>
                                    <td>{r?.phone ?? "—"}</td>
                                    <td>{formatLocation(r?.location)}</td>
                                    <td className="inventory-muted">{jsAgo(r?.createdat ?? r?.createdAt)}</td>
                                </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
