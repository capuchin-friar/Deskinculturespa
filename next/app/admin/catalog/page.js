"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
// import { deleteProduct, getShopsByOwner, getProducts } from "../../../lib/productApi"
// import { set_admin_shop_details } from "../../../redux/admin/admin_shop"
import "./styles/xxl.css"
import "./styles/s.css"
import { api } from "../../api/shared/config"
import AdminLoader from "@/src/components/admin/AdminLoader"
import {
  IoVideocamOutline,
  IoLocationOutline
} from "react-icons/io5";
import "./appointment.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";
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
  const candidates = Array.isArray(list) ? list : [list]
  for (const raw of candidates) {
    if (typeof raw !== "string" || !raw.trim()) continue
    const u = raw.trim()
    if (/^https?:\/\//i.test(u)) return u
    if (u.startsWith("/")) return `/api/backend${u}`
    return u
  }
  return null
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
  s_n,
  item,
  menuOpenId,
  onToggleMenu,
  onDeleteProduct,
  type
}) {
  const productId = item?.id ?? item?.product_id
  const name = String(item?.name ?? item?.slug ?? item?.mode ?? item?.subcategory ?? "—")
    .replace(/[-_]+/g, " ")
    .trim()
  const mode = String(item?.mode ?? "").toLowerCase()
  const status = String(
    item?.status ??
      (item?.is_active === false ? "inactive" : item?.is_active ? "active" : "—")
  ).toLowerCase()
  const duration = type === "packages"
    ? `${item?.duration_months ?? "_"} months`
    : `${item?.duration_minutes ?? "_"} minutes`
  const createdAt = item?.created_at ?? item?.createdAt
  const totalSales = item?.total_sales ?? item?.totalSales
  const price = item?.price ?? "_"
  const currency = "₦"
  const thumb = firstImageUrl(
    Array.isArray(item?.images) && item.images.length
      ? item.images
      : [item?.image_url, item?.thumbnail_url]
  )
  const menuOpen = productId != null && menuOpenId === productId
  const editHref =
    productId != null
      ? `/admin/create?product=${encodeURIComponent(String(productId))}&type=${encodeURIComponent(type)}&edit=${encodeURIComponent(true)}`
      : "#"
  const folderPath = item.specifications?.hash ?? null;

  return (
    <tr>
      <td className="product-list-sn">{s_n}</td>

      <td>
        <div className="product-list-cell-product">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="product-list-thumb" src={thumb} alt="" width={44} height={44} />
          ) : (
            <span className="product-list-thumb-placeholder" aria-hidden />
          )}

          <span className="product-list-title">
            <span>{name.charAt(0).toUpperCase()}{name.slice(1)}</span>
            &nbsp;
            {
              type === "appointment" &&
              <span
                className={`appointment-mode-label ${mode === "physical" ? "in-person" : "online"
                  }`}
              >
                {mode === "physical" ? (
                  <>
                    <IoLocationOutline />
                    In-person
                  </>
                ) : (
                  <>
                    <IoVideocamOutline />
                    {mode === "audio" ? "Phone" : "Online"}
                  </>
                )}
              </span>
            }
          </span>
        </div>
      </td>
      <td>
        {type === "appointment" || type === "packages" ? (
          duration
        ) : (
          <span
            className={`product-list-pill${
              status === "active" ? " product-list-pill--ok" : status === "inactive" ? " product-list-pill--bad" : ""
            }`}
          >
            {status}
          </span>
        )}
      </td>
      <td className="product-list-num">{formatRevenue(price, "NGN")}</td>
      <td className="product-list-num">{formatSalesCount(totalSales)}</td>
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
                  if (type === "packages" || folderPath != null) onDeleteProduct(folderPath, productId)
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
  let [packages, setPackages] = useState([]);
  let [type, setType] = useState("products");
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
   
    (async () => {
      setLoading(true)
      setListError("")
      try {
        await getCatalog(type);
      } catch (error) {
        const status = error?.response?.status;
        setListError(
          status === 401
            ? "Sign in with an admin account to load the catalog."
            : error?.response?.data?.data || error?.message || "Could not load the catalog.",
        );
      } finally {
        setLoading(false);
      }
    })()

  }, [type])


  function asList(value) {
    return Array.isArray(value) ? value : [];
  }

  async function getCatalog(type) {
    if (type === "products") {
      const { data: products } = await api.get("/products");
      setProds(asList(products.data));
    } else if (type === "services") {
      const { data: services } = await api.get("/services");
      setServices(asList(services.data));
    } else if (type === "packages") {
      const { data: packageRes } = await api.get("/packages");
      setPackages(asList(packageRes.data));
    } else {
      const { data: appointments } = await api.get("/appointment_offerings");
      setAppointments(asList(appointments.data));
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
    return type === "products"
      ? prods
      : type === "services"
        ? services
        : type === "packages"
          ? packages
          : appointments
  }

  const onDeleteProduct = useCallback(
    async (hash, productId) => {
      setDeleteError("")
      if (type === "packages") {
        if (!window.confirm("Delete this package? This cannot be undone.")) {
          return
        }
        try {
          const { data } = await api.delete("packages/delete", {
            data: { package_id: productId },
          })
          if (!data.success) {
            throw new Error(data.message || "Could not delete package.")
          }
          setPackages((prev) =>
            prev.filter((p) => String(p?.id ?? p?.product_id) !== String(productId))
          )
          setMenuOpenId(null)
        } catch (err) {
          setDeleteError(err?.message || "Could not delete package.")
        }
        return
      }
      if (!window.confirm("Delete this product? Inventory for this product will be removed. This cannot be undone.")) {
        return
      }
      try {
        api.delete("delete/folder-delete", {
          data: {
            product_id: hash
          }
        }).then(async (response) => {
          if (response.data.success) {
            const {
              data
            } = await api.delete("products/delete", {
              data: {
                product_id: productId
              }
            });
            if (!data.success) {
              throw new Error("Error: ", data.message);
              return;
            }
            setProds((prev) =>
              prev.filter((p) => String(p?.id ?? p?.product_id) !== String(productId))
            )
          } else {
            throw new Error(response.data.message);
          }
        }).catch(err => {
          console.log(err);
          alert("Error: ", err);
        })

        setMenuOpenId(null)
      } catch (err) {
        setDeleteError(err?.message || "Could not delete product.")
      }
    },
    [admin_id, type]
  )

  return (
    <div style={{
      height: "calc(100vh - 60px)",
      overflow: "auto"
    }}>
      <div className="product-list-header">
        <div className="catalog-type-filter">
          <label htmlFor="catalog-type">Type</label>
          <select id="catalog-type" aria-label="Type" value={type} onChange={e => setType(e.target.value)}>
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
                name: "Appointments",
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

        <span className="add_btn">
          <button
            type="button"
            onClick={() => {
              window.location.href = `/admin/create/${type === "appointment" ? "appointment" : type === "packages" ? "package" : type.slice(0, type.length - 1)}`;
            }}
          >
            + Add {`${type.charAt(0).toUpperCase()}${type.slice(1)}`}
          </button>
        </span>
      </div>


      {loading ? <AdminLoader label={`Loading ${type}`} /> : null}
      {!loading && listError ? <p style={{ color: "#c00" }}>{listError}</p> : null}
      {!loading && deleteError ? <p style={{ color: "#c00" }}>{deleteError}</p> : null}

      <div className="product-list-wrap">
        <table className="product-list-table">
          <thead>
            <tr>
              <th scope="col">S/N</th>
              <th scope="col">{`${type.charAt(0).toUpperCase()}${type.slice(1)}`}</th>
              <th scope="col">{type === "appointment" || type === "packages" ? "Duration" : "Status"}</th>
              <th scope="col">Price</th>
              <th scope="col">Total sales</th>
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
                if (loading) return null;
                if (!Array.isArray(data) || data.length === 0) {
                  return (
                    <tr>
                      <td className="product-list-empty" colSpan={7}>
                        No {type} in the catalog yet.
                      </td>
                    </tr>
                  );
                }
                return data.map((prod, index) => (
                    <ProductTableRow
                      key={
                        prod?.id ??
                        prod?.product_id ??
                        `prod-${index}`
                      }
                      s_n={index + 1}
                      item={prod}
                      menuOpenId={menuOpenId}
                      onToggleMenu={toggleActionMenu}
                      type={type}
                      onDeleteProduct={onDeleteProduct}
                    />
                  ));
              })()
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
