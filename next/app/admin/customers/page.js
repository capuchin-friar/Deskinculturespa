"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import "./styles/xxl.css"
import "./styles/s.css"
import api from "../../api/config"


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
        setRows(Array.isArray(data) ? data.filter(u => u.role.toLowerCase() === role.toLowerCase()) : [])
    }, [role, data])

    function formatLocation(obj){
        let city;
        let state;
        Object.entries(obj).map(([key, value], index) => {
            if(key === "city"){
                city = value
            }
            if(key === "state"){
                state = value
            }
        })
        if(city === null || state === null){
            return `_`;
        }
        return `${city}, ${state} State.`;
    }


    return (
        <div className="inventory-page">
            <div className="inventory-header">
                <h5>Users</h5>
                {["customer", "admin"].length > 0 ? (
                    <div className="inventory-shop-select">
                        <select aria-label="Role" value={role} onChange={(e) => {setRole(e.target.value)}}>
                            {["customer", "admin"].map((role, index) => {
                                return (
                                    <option key={index} value={role}>
                                        {role ?? "—"}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                ) : null}
            </div>

            {loading ? <p>Loading Users</p> : null}
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
                        {!loading &&
                            rows.map((r, index) => (
                                <tr key={index}>
                                    <td>{r?.id ?? "—"}</td>
                                    <td>{`${r?.fname} ${r?.lname}` ?? "—"}</td>
                                    <td>{r?.email ?? "—"}</td>
                                    <td>{r?.phone ?? "—"}</td>
                                    <td>{formatLocation(r?.location) ?? "—"}</td>
                                    <td>{jsAgo(r?.createdat)}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}



