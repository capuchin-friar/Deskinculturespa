"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
// import { deleteProduct, getShopsByOwner, getProducts } from "../../../lib/productApi"
// import { set_admin_shop_details } from "../../../redux/admin/admin_shop"
import "./styles/xxl.css"
import "./styles/s.css"
import api from "../../api/config"

function shopRowId(s) {
  return s?.id ?? s?.shop_id
}

/** @param {unknown} images */
function firstImageUrl(images) {
  let list = images
  if (typeof list === "string") {
    try {
      list = JSON.parse(list)
    } catch {
      return list.trim() || null
    }
  }
  if (!Array.isArray(list) || list.length === 0) return null
  const raw = list[0]
  if (typeof raw !== "string" || !raw.trim()) return null
  const u = raw.trim()
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith("/")) return `/api/backend${u}`
  return u
}

function formatCreatedAt(value) {
  if (value == null || value === "") return "—"
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatSalesCount(n) {
  if (n == null || n === "") return "—"
  const num = Number(n)
  if (Number.isNaN(num)) return "—"
  return num.toLocaleString()
}

function formatRevenue(n, currency) {
  if (n == null || n === "") return "—"
  const num = Number(n)
  if (Number.isNaN(num)) return "—"
  const cur = typeof currency === "string" && currency.trim() ? currency.trim() : "NGN"
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(num)
  } catch {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}

function ProductTableRow({
  item,
  menuOpenId,
  onToggleMenu,
  onDeleteProduct,
  type
}) {
  const productId = item?.id ?? item?.product_id
  const name = item?.name ?? item?.mode ?? "—"
  const status = item?.status ?? item?.is_active ? "active" : "inactive" ?? "_"
  const createdAt = item?.created_at ?? item?.createdAt
  const totalSales = item?.total_sales ?? item?.totalSales
  const price = item?.price ?? "_"
  const currency = "₦"
  const thumb = firstImageUrl(item?.images)
  const menuOpen = productId != null && menuOpenId === productId
  const editHref =
    productId != null
      ? `/admin/create?product=${encodeURIComponent(String(productId))}&type=${encodeURIComponent(type)}&edit=${encodeURIComponent(true)}`
      : "#"

  return (
    <tr>
      <td>
        <div className="product-list-cell-product">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="product-list-thumb" src={thumb} alt="" width={44} height={44} />
          ) : (
            <span className="product-list-thumb-placeholder" aria-hidden />
          )}
          <span className="product-list-title">{name.charAt(0).toUpperCase()}{name.slice(1)}</span>
        </div>
      </td>
      <td>{status}</td>
      <td className="product-list-num">{formatSalesCount(totalSales)}</td>
      <td className="product-list-num">{formatRevenue(price, "NGN")}</td>
      <td className="product-list-num">{formatCreatedAt(createdAt)}</td>
      <td className="product-list-actions-cell">
        <div className="product-list-actions">
          <button
            type="button"
            className="product-list-actions-trigger"
            aria-label="Product actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation()
              if (productId != null) onToggleMenu(productId)
            }}
          >
            ⋮
          </button>
          {menuOpen ? (
            <div
              className="product-list-actions-menu"
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={editHref}
                className="product-list-actions-item"
                role="menuitem"
                onClick={() => onToggleMenu(null)}
              >
                Edit
              </Link>
              <button
                type="button"
                className="product-list-actions-item product-list-actions-item-danger"
                role="menuitem"
                onClick={() => {
                  if (productId != null) onDeleteProduct(productId)
                }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

export default function ProductListPage() {
  let dispatch = useDispatch()
  let admin_id = useSelector((s) => s.admin?.admin_id)
  let [prods, setProds] = useState([]);
  let [services, setServices] = useState([]);
  let [appointments, setAppointments] = useState([]);
  let [type, setType] = useState("product")
  let [loading, setLoading] = useState(true)
  let [listError, setListError] = useState("")
  let [menuOpenId, setMenuOpenId] = useState(null)
  let [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (menuOpenId == null) return
    const onDocClick = () => setMenuOpenId(null)
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpenId(null)
    }
    document.addEventListener("click", onDocClick)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("click", onDocClick)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpenId])

  useEffect(() => {
    // if (admin_id == null) {
    //   setLoading(false)
    //   setProds([])
    //   return
    // }

    // let cancelled = false;
    (async () => {
      setLoading(true)
      setListError("")
      try {
        // if (cancelled) return
        await getCatalog(type);

        setLoading(false);
      } catch (e) {
        // if (!cancelled) {
        //   setProds([])
        //   setListError(e?.message || "Could not load products.")
        // }
      } finally {
        // if (!cancelled) setLoading(false)
      }
    })()

    // return () => {
    //   cancelled = true
    // }
  }, [type])


  async function getCatalog(type) {
    if (type === "products") {
      const { data: products } = await api.get("/products");
      setProds(products.data);
    } else if (type === "services") {
      const { data: services } = await api.get("/services");
      setServices(services.data);
    } else {
      const { data: appointments } = await api.get("/appointment_offerings");
      setAppointments(appointments.data);
    }
  }



  const toggleActionMenu = useCallback((id) => {
    if (id == null) {
      setMenuOpenId(null)
      return
    }
    setMenuOpenId((cur) => (cur === id ? null : id))
  }, [])

  function getTypeData() {
    return type === "products" ? prods : type === "services" ? services : appointments
  }

  //   const onDeleteProduct = useCallback(
  //     async (productId) => {
  //       setDeleteError("")
  //       const shopIdNum = Number.parseInt(String(selectedShopId), 10)
  //       if (admin_id == null || Number.isNaN(shopIdNum)) {
  //         setDeleteError("Missing shop or account.")
  //         return
  //       }
  //       if (!window.confirm("Delete this product? Inventory for this product will be removed. This cannot be undone.")) {
  //         return
  //       }
  //       try {
  //         await deleteProduct(shopIdNum, productId, admin_id)
  //         setProds((prev) =>
  //           prev.filter((p) => String(p?.id ?? p?.product_id) !== String(productId))
  //         )
  //         setMenuOpenId(null)
  //       } catch (err) {
  //         setDeleteError(err?.message || "Could not delete product.")
  //       }
  //     },
  //     [admin_id, selectedShopId]
  //   )

  return (
    <div style={{
      height: "calc(100vh - 60px)",
      overflow: "auto"
    }}>
      <div className="product-list-header">
        <span>
          <select aria-label="Type" value={""} onChange={e => setType(e.target.value)}>
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
        </span>

        <span className="add_btn">
          <button onClick={e => window.location.href = `/admin/create?type=${type}`}>
            + Add {`${type.charAt(0).toUpperCase()}${type.slice(1)}`}
          </button>
        </span>
      </div>


      {loading ? <p>Loading {type}</p> : null}
      {!loading && listError ? <p style={{ color: "#c00" }}>{listError}</p> : null}
      {!loading && deleteError ? <p style={{ color: "#c00" }}>{deleteError}</p> : null}

      <div className="product-list-wrap">
        <table className="product-list-table">
          <thead>
            <tr>
              <th scope="col">{`${type.charAt(0).toUpperCase()}${type.slice(1)}`}</th>
              <th scope="col">Status</th>
              <th scope="col">Total sales</th>
              <th scope="col">Total revenue</th>
              <th scope="col">Created</th>
              <th scope="col" className="product-list-actions-th">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {
              (() => {
                const data = getTypeData();

                return !loading
                  ? data.map((prod, index) => (
                    <ProductTableRow
                      key={
                        prod?.id ??
                        prod?.product_id ??
                        `prod-${index}`
                      }
                      item={prod}
                      menuOpenId={menuOpenId}
                      onToggleMenu={toggleActionMenu}
                      type={type}
                      onDeleteProduct={""}
                    />
                  ))
                  : null;
              })()
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
