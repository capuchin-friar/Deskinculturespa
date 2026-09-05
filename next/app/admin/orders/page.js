"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
// import { getOrdersByShop, getShopsByOwner } from "../../../lib/productApi"
// import { set_admin_shop_details } from "../../../redux/admin/admin_shop"
import "./styles/xxl.css"
import "./styles/s.css"

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

function orderRowCustomerId(row) {
  const v = row?.customer_id ?? row?.customerId
  if (v == null || v === "") return null
  return v
}

function buildOrderInboxHref({ customerId, orderId, adminId }) {
  const params = new URLSearchParams()
  params.set("customerId", String(customerId))
  if (orderId != null && String(orderId) !== "") params.set("orderId", String(orderId))
  if (adminId != null && String(adminId) !== "") params.set("adminId", String(adminId))
  // return `/admin/inbox?${params.toString()}`
}

export default function ManageOrders() {
  const router = useRouter()
  const dispatch = useDispatch()
  const adminId = useSelector((s) => s.admin?.admin_id)

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (adminId == null) {
      setLoading(false)
      setRows([])
      return
    }
    let cancelled = false;
    (async () => {
      setLoading(true)
      setError("")
      try {
        let orders; // Implement orders api for admin here
        if (cancelled) return
        const orderList = Array.isArray(orders?.data) ? orders.data : [];
        setRows(orderList);
        if (orderList.length === 0) {
          setRows([])
          setError("No orders found.")
          return
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
  }, [adminId])



  const goToOrderChat = (row) => {
    const cid = orderRowCustomerId(row)
    if (cid == null) return
    router.push(
      buildOrderInboxHref({
        customerId: cid,
        orderId: row?.order_id,
        adminId: selectedShopId,
      })
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        {/* <h5>Orders</h5> */}
        {(
          <div className="orders-shop-select">
            <select aria-label="Type" value={""} onChange={""}>
              {[
                {
                  name: "All",
                  value: "all"
                },
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

      {loading ? <p>Loading orders…</p> : null}
      {!loading && error ? <p className="orders-error">{error}</p> : null}

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              {[
                "Order ID",
                "Type",
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
            {!loading &&
              rows.map((r, index) => (
                <tr key={r?.order_id ?? `order-${index}`}>
                  <td>{r?.order_id ?? "—"}</td>
                  <td>{r?.product ?? "—"}</td>
                  <td>{r?.customer ?? "—"}</td>
                  <td>{r?.qty ?? 0}</td>
                  <td>{formatAmount(r?.amount)}</td>
                  <td>{r?.payment ?? "—"}</td>
                  <td>{r?.status ?? "—"}</td>
                  <td>{r?.delivery ?? "—"}</td>
                  <td>{jsAgo(r?.date)}</td>
                  <td className="orders-actions-cell">
                    <button
                      type="button"
                      style={{ color: "#000" }}
                      className="orders-action-btn"
                      onClick={() => router.push(`/admin/orders/${r?.order_id ?? ""}`)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="orders-chat-btn"
                      disabled={orderRowCustomerId(r) == null}
                      title={
                        orderRowCustomerId(r) == null
                          ? "No registered customer on this order"
                          : "Message this customer"
                      }
                    // onClick={() => goToOrderChat(r)}
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
