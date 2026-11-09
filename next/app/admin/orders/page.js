"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLoader from "@/src/components/admin/AdminLoader"
import { useDispatch, useSelector } from "react-redux"
// import { getOrdersByShop, getShopsByOwner } from "../../../lib/productApi"
// import { set_admin_shop_details } from "../../../redux/admin/admin_shop"
import "./styles/xxl.css"
import "./styles/s.css"
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

function shopRowId(s) {
  return s?.id ?? s?.shop_id
}

function formatAmount(n) {
  const num = Number(n)
  if (Number.isNaN(num)) return "—"
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(num)
}

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
  return `${Math.floor(days / 365)}y ago`
}

function customerPhone(row) {
  const raw = row?.customer_phone ?? row?.phone ?? ""
  const digits = String(raw).replace(/[^\d]/g, "")
  if (!digits) return ""
  if (digits.startsWith("234")) return digits
  if (digits.startsWith("0")) return `234${digits.slice(1)}`
  return digits
}

function toneClass(value) {
  const v = String(value || "").toLowerCase()
  if (["paid", "completed", "confirmed", "delivered", "success", "successful"].includes(v)) {
    return "orders-pill orders-pill--ok"
  }
  if (["pending", "processing", "unpaid", "scheduled"].includes(v)) {
    return "orders-pill orders-pill--warn"
  }
  if (["failed", "cancelled", "canceled", "refunded", "declined"].includes(v)) {
    return "orders-pill orders-pill--bad"
  }
  return "orders-pill"
}

function whatsappHref(row) {
  const phone = customerPhone(row)
  if (!phone) return ""
  const name = String(row?.customer || "").trim()
  const orderId = row?.id ?? row?.order_id
  const text = encodeURIComponent(
    name
      ? `Hello ${name}, this is Deskinculture regarding order #${orderId}.`
      : `Hello, this is Deskinculture regarding order #${orderId}.`,
  )
  return `https://wa.me/${phone}?text=${text}`
}

export default function ManageOrders() {
  const router = useRouter()
  const dispatch = useDispatch()
  const adminId = useSelector((s) => s.admin?.admin_id)

  const [rows, setRows] = useState([])
  const [kind, setKind] = useState("products")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true)
      setError("")
      try {
        const query = kind && kind !== "all" ? `?kind=${encodeURIComponent(kind)}` : ""
        const response = await fetch(`/api/admin/orders${query}`, { credentials: "include" })
        const result = await response.json()
        if (cancelled) return
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load orders.")
        }
        const orderList = Array.isArray(result.data) ? result.data : [];
        setRows(orderList);
        if (orderList.length === 0) {
          setError("No orders found.")
        }
      } catch (e) {
        if (!cancelled) {
          setRows([])
          setError(e?.message || "Could not load orders.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [kind])



  const goToOrderChat = (row) => {
    const href = whatsappHref(row)
    if (!href) return
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        {/* <h5>Orders</h5> */}
        {(
          <div className="orders-shop-select">
            <select aria-label="Type" value={kind} onChange={(event) => setKind(event.target.value)}>
              {[
                {
                  name: "Products",
                  value: "products"
                },
                {
                  name: "Services",
                  value: "services"
                },
                {
                  name: "Appointment",
                  value: "appointment",
                },
                {
                  name: "Packages",
                  value: "packages",
                }
              ].map(({ name, value }, index) => {
                return (
                  <option value={value} key={index}>
                    {name}
                  </option>
                )
              })}
            </select>
          </div>
        )}

      </div>

      {loading ? <AdminLoader label="Loading orders" /> : null}
      {!loading && error ? <p className="orders-error">{error}</p> : null}

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              {[
                "Order ID",
                "Name",
                "Buyer",
                "Qty",
                "Amount",
                "Payment",
                "Status",
                "Delivery",
                "Date",
                "Actions",
              ].map((h) => (
                <th key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 ? (
              <tr>
                <td className="orders-empty-cell" colSpan={10}>
                  No orders in this list yet.
                </td>
              </tr>
            ) : null}
            {!loading &&
              rows.map((r, index) => (
                <tr key={`${r?.kind}-${r?.id ?? r?.order_id ?? index}`}>
                  <td className="orders-id">{r?.id ?? r?.order_id ?? "—"}</td>
                  <td className="orders-title">{r?.title ?? r?.product ?? "—"}</td>
                  <td>{r?.customer ?? "—"}</td>
                  <td className="orders-num">{r?.qty ?? 0}</td>
                  <td className="orders-num">{formatAmount(r?.amount)}</td>
                  <td>
                    <span className={toneClass(r?.payment)}>{r?.payment ?? "—"}</span>
                  </td>
                  <td>
                    <span className={toneClass(r?.status)}>{r?.status ?? "—"}</span>
                  </td>
                  <td>
                    <span className={toneClass(r?.delivery)}>{r?.delivery ?? "—"}</span>
                  </td>
                  <td>{jsAgo(r?.date)}</td>
                  <td className="orders-actions-cell">
                    <button
                      type="button"
                      className="orders-action-btn"
                      onClick={() => router.push(`/admin/orders/${r?.id ?? ""}?kind=${encodeURIComponent(r?.kind || "product")}`)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="orders-chat-btn"
                      disabled={!customerPhone(r)}
                      title={
                        customerPhone(r)
                          ? "Message this customer on WhatsApp"
                          : "No phone number on this customer"
                      }
                     onClick={() => goToOrderChat(r)}
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
