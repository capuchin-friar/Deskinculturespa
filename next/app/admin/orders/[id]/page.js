"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import "./styles/s.css";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

function money(value, currency = "NGN") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);
  } catch {
    return `₦${amount.toFixed(2)}`;
  }
}

function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

function formatDay(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function parseAddress(raw) {
  if (!raw) return "";
  if (typeof raw === "object") {
    return [raw.street, raw.town, raw.city, raw.state].filter(Boolean).join(", ");
  }
  const text = String(raw).trim();
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      return [parsed.street, parsed.town, parsed.city, parsed.state].filter(Boolean).join(", ") || text;
    }
  } catch {
    return text;
  }
  return text;
}

function parseLocation(raw) {
  if (!raw) return "";
  if (typeof raw === "string") {
      try {
      return parseLocation(JSON.parse(raw));
      } catch {
      return raw;
    }
  }
  return [raw.city, raw.state].filter(Boolean).join(", ");
}

function labelize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function kindLabel(kind) {
  if (kind === "service") return "Service visit";
  if (kind === "appointment") return "Consultation";
  return "Product order";
}

function productStages(record) {
  const status = String(record.fulfillment_status || record.status || "").toLowerCase();
  const paid = String(record.payment_status || "").toLowerCase() === "paid";
  const cancelled = status === "cancelled" || status === "canceled";
  const rank = {
    order_placed: 1,
    pending: 1,
    processing: 2,
    ready_for_pickup: 3,
    shipped: 4,
    delivered: 5,
    completed: 5,
    cancelled: 0,
  }[status] || (paid ? 1 : 0);

  const steps = [
    { key: "created", label: "Order created", done: true, at: record.created_at },
    { key: "paid", label: "Payment received", done: paid, at: paid ? record.created_at : null },
    { key: "processing", label: "Processing", done: rank >= 2, at: rank >= 2 ? record.updated_at : null },
    { key: "ready", label: "Ready for pickup", done: rank >= 3, at: null },
    { key: "shipped", label: "Shipped", done: rank >= 4 || Boolean(record.tracking_number), at: null },
    { key: "delivered", label: "Delivered", done: rank >= 5, at: null },
  ];

  if (cancelled) {
    return [
      { key: "created", label: "Order created", done: true, at: record.created_at },
      { key: "cancelled", label: "Cancelled", done: true, at: record.updated_at },
    ];
  }
  return steps;
}

function visitStages(record) {
  const status = String(record.status || "").toLowerCase();
  const paid = String(record.payment_status || "").toLowerCase() === "paid";
  if (status === "cancelled" || status === "canceled") {
    return [
      { key: "created", label: "Created", done: true, at: record.created_at },
      { key: "cancelled", label: "Cancelled", done: true, at: record.updated_at },
    ];
  }
  return [
    { key: "created", label: "Created", done: true, at: record.created_at },
    { key: "paid", label: "Payment received", done: paid, at: paid ? record.created_at : null },
    { key: "scheduled", label: "Scheduled", done: Boolean(record.scheduled_at), at: record.scheduled_at },
    { key: "confirmed", label: "Confirmed", done: ["confirmed", "completed"].includes(status), at: null },
    { key: "completed", label: "Completed", done: status === "completed", at: null },
  ];
}

function attention(record) {
  const payment = String(record.payment_status || "").toLowerCase();
  const status = String(record.fulfillment_status || record.status || "").toLowerCase();
  if (["cancelled", "canceled"].includes(status)) return "Cancelled";
  if (payment !== "paid") return "Payment outstanding";
  if ((record.kind === "service" || record.kind === "appointment") && !record.scheduled_at) return "Needs scheduling";
  if (record.kind === "product" && status === "shipped" && !record.tracking_number) return "Missing tracking";
  if (record.kind === "product" && ["order_placed", "pending", "processing"].includes(status)) return "Needs fulfilment";
  return "";
}

function nextStatuses(record) {
  const kind = record.kind;
  const status = String(record.fulfillment_status || record.status || "").toLowerCase();
  if (kind === "product") {
    if (["delivered", "completed", "cancelled", "canceled"].includes(status)) return [];
    if (["order_placed", "pending"].includes(status)) return ["processing", "cancelled"];
    if (status === "processing") return ["ready_for_pickup", "shipped", "cancelled"];
    if (status === "ready_for_pickup") return ["shipped", "delivered", "cancelled"];
    if (status === "shipped") return ["delivered"];
    return ["processing", "cancelled"];
  }
  if (["completed", "cancelled", "canceled"].includes(status)) return [];
  if (status === "pending") return ["confirmed", "cancelled"];
  if (status === "confirmed") return ["completed", "cancelled"];
  return ["confirmed", "cancelled"];
}

function Badge({ tone, children }) {
  return <span className={`ops-badge ops-badge--${tone}`}>{children}</span>;
}

function paymentTone(status) {
  const value = String(status || "").toLowerCase();
  if (value === "paid") return "ok";
  if (value === "failed" || value === "refunded") return "warn";
  return "muted";
}

function statusTone(status) {
  const value = String(status || "").toLowerCase();
  if (["delivered", "completed", "confirmed"].includes(value)) return "ok";
  if (["cancelled", "canceled", "failed"].includes(value)) return "warn";
  if (["shipped", "processing", "ready_for_pickup"].includes(value)) return "info";
  return "muted";
}

function OrderDetailsScreen() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id != null ? String(params.id) : "";
  const kind = searchParams.get("kind") || "product";

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [confirmStatus, setConfirmStatus] = useState("");
  const [shipping, setShipping] = useState({
    shipping_method: "",
    logistic_provider: "",
    tracking_number: "",
    estimated_delivery_date: "",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}?kind=${encodeURIComponent(kind)}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Record not found.");
      }
      setRecord(result.data);
      setShipping({
        shipping_method: result.data.shipping_method || "",
        logistic_provider: result.data.logistic_provider || "",
        tracking_number: result.data.tracking_number || "",
        estimated_delivery_date: formatDay(result.data.estimated_delivery_date),
      });
    } catch (loadError) {
      setRecord(null);
      setError(loadError.message || "Could not load this record.");
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing order id.");
      return;
    }
    load();
  }, [id, kind]);

  const patch = async (body, actionKey) => {
    setSaving(actionKey);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}?kind=${encodeURIComponent(kind)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Update failed.");
      setRecord(result.data);
      setShipping({
        shipping_method: result.data.shipping_method || "",
        logistic_provider: result.data.logistic_provider || "",
        tracking_number: result.data.tracking_number || "",
        estimated_delivery_date: formatDay(result.data.estimated_delivery_date),
      });
      setMessage("Saved.");
      setConfirmStatus("");
      if (body.note) setNote("");
    } catch (saveError) {
      setMessage(saveError.message || "Could not save.");
    } finally {
      setSaving("");
    }
  };

  const items = Array.isArray(record?.items) ? record.items : [];
  const currency = record?.currency || "NGN";
  const stages = useMemo(
    () => (record ? (record.kind === "product" ? productStages(record) : visitStages(record)) : []),
    [record],
  );
  const needsAttention = record ? attention(record) : "";
  const actions = record ? nextStatuses(record) : [];
  const address = parseAddress(record?.shipping_address);
  const location = parseLocation(record?.customer_location);
  const events = Array.isArray(record?.events) ? record.events : [];

  return (
    <div className="ops-page">
      <Link className="ops-back" href="/admin/orders">
        ← Orders
      </Link>

      {loading ? <p className="ops-state">Loading order…</p> : null}
      {!loading && error ? <p className="ops-state ops-state--error" role="alert">{error}</p> : null}

      {!loading && record ? (
        <>
          <header className="ops-header">
              <div>
              <p className="ops-kicker">{kindLabel(record.kind)}</p>
              <h1>#{record.id}</h1>
              <p className="ops-meta">
                Created {formatWhen(record.created_at) || "—"}
                {record.title ? ` · ${record.title}` : ""}
              </p>
                  </div>
            <div className="ops-header-flags">
              <Badge tone={statusTone(record.fulfillment_status || record.status)}>
                {labelize(record.fulfillment_status || record.status || "pending")}
              </Badge>
              <Badge tone={paymentTone(record.payment_status)}>
                Payment {labelize(record.payment_status || "pending")}
              </Badge>
              {needsAttention ? <Badge tone="alert">{needsAttention}</Badge> : null}
                </div>
          </header>

          {actions.length ? (
            <div className="ops-actions" role="toolbar" aria-label="Order actions">
              {actions.map((status) => (
                      <button
                  key={status}
                        type="button"
                  className={`ops-btn${status === "cancelled" ? " ops-btn--danger" : " ops-btn--primary"}`}
                  disabled={Boolean(saving)}
                  onClick={() => setConfirmStatus(status)}
                >
                  {status === "cancelled" ? "Cancel" : `Mark ${labelize(status)}`}
                      </button>
              ))}
                    </div>
                  ) : null}

          {confirmStatus ? (
            <div className="ops-confirm" role="dialog" aria-modal="true" aria-labelledby="ops-confirm-title">
              <p id="ops-confirm-title">
                Update this {kindLabel(record.kind).toLowerCase()} to <strong>{labelize(confirmStatus)}</strong>?
              </p>
              <div className="ops-confirm-actions">
                <button type="button" className="ops-btn" onClick={() => setConfirmStatus("")} disabled={Boolean(saving)}>
                  Keep current status
                        </button>
                      <button
                        type="button"
                  className={`ops-btn${confirmStatus === "cancelled" ? " ops-btn--danger" : " ops-btn--primary"}`}
                  disabled={Boolean(saving)}
                  onClick={() => patch({ status: confirmStatus }, "status")}
                >
                  {saving === "status" ? "Updating…" : "Confirm"}
                      </button>
                    </div>
                  </div>
          ) : null}

          {message ? <p className="ops-feedback" role="status">{message}</p> : null}

          <ol className="ops-timeline" aria-label="Order progress">
            {stages.map((step) => (
              <li key={step.key} className={step.done ? "is-done" : ""}>
                <span className="ops-timeline-dot" aria-hidden />
                <span>
                  <strong>{step.label}</strong>
                  {step.at ? <small>{formatWhen(step.at)}</small> : <small>{step.done ? "Complete" : "Pending"}</small>}
                    </span>
              </li>
            ))}
          </ol>

          <div className="ops-grid">
            <div className="ops-main">
              <section className="ops-card">
                <h2>Items</h2>
                {items.length === 0 ? (
                  <p className="ops-empty">No line items on this record.</p>
                ) : (
                  <ul className="ops-items">
                    {items.map((item) => (
                      <li key={item.id || item.item_id}>
                        <div className="ops-item-thumb">
                          {item.thumbnail_url ? <img src={item.thumbnail_url} alt="" /> : <span aria-hidden />}
                  </div>
                        <div>
                          <p className="ops-item-name">{item.name || "Item"}</p>
                          <p className="ops-item-meta">
                            Qty {item.units || 1}
                            {item.duration_minutes ? ` · ${item.duration_minutes} min` : ""}
                            {item.mode ? ` · ${labelize(item.mode)}` : ""}
                          </p>
                  </div>
                        <div className="ops-item-price">
                          <span>{money(item.unit_price, currency)}</span>
                          <strong>{money(item.total_price, currency)}</strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                </section>

              <section className="ops-card">
                <h2>Payment</h2>
                <dl className="ops-facts">
                  <div>
                    <dt>Items</dt>
                    <dd>{money(record.amount_paid || record.amount, currency)}</dd>
                    </div>
                  {record.kind === "product" ? (
                    <>
                      <div>
                        <dt>Shipping</dt>
                        <dd>{money(record.shipping_fee, currency)}</dd>
                    </div>
                      <div>
                        <dt>Tax</dt>
                        <dd>{money(record.tax, currency)}</dd>
                  </div>
                      <div>
                        <dt>Charges</dt>
                        <dd>{money(record.charges, currency)}</dd>
            </div>
          </>
        ) : null}
                  <div className="ops-facts-total">
                    <dt>Total paid</dt>
                    <dd>{money(record.total_paid || record.amount, currency)}</dd>
      </div>
                  <div>
                    <dt>Method</dt>
                    <dd>{record.payment_reference ? "Paystack" : "—"}</dd>
          </div>
                  <div>
                    <dt>Reference</dt>
                    <dd>{record.payment_reference || "—"}</dd>
                </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{labelize(record.payment_status || "pending")}</dd>
              </div>
                </dl>
              </section>

              {record.kind === "product" ? (
                <section className="ops-card">
                  <h2>Shipping</h2>
                  <p className="ops-address">{address || "No delivery address on file."}</p>
                  <form
                    className="ops-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      patch(shipping, "shipping");
                    }}
                  >
                    <label>
                      <span>Shipping method</span>
                      <input
                        value={shipping.shipping_method}
                        onChange={(event) => setShipping((current) => ({ ...current, shipping_method: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Logistics provider</span>
                      <input
                        value={shipping.logistic_provider}
                        onChange={(event) => setShipping((current) => ({ ...current, logistic_provider: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Tracking number</span>
                      <input
                        value={shipping.tracking_number}
                        onChange={(event) => setShipping((current) => ({ ...current, tracking_number: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Estimated delivery</span>
                      <input
                        type="date"
                        value={shipping.estimated_delivery_date}
                        onChange={(event) => setShipping((current) => ({ ...current, estimated_delivery_date: event.target.value }))}
                      />
                    </label>
                    <button className="ops-btn ops-btn--primary" type="submit" disabled={saving === "shipping"}>
                      {saving === "shipping" ? "Saving…" : "Save shipping"}
              </button>
                  </form>
                </section>
              ) : (
                <section className="ops-card">
                  <h2>Visit</h2>
                  <dl className="ops-facts">
                    <div>
                      <dt>Scheduled</dt>
                      <dd>{record.scheduled_at ? formatWhen(record.scheduled_at) : "Not scheduled"}</dd>
            </div>
                    {record.consultant ? (
                      <div>
                        <dt>Consultant</dt>
                        <dd>{record.consultant}</dd>
        </div>
      ) : null}
                  </dl>
                </section>
              )}
            </div>

            <aside className="ops-rail">
              <section className="ops-card">
                <h2>Buyer</h2>
                <p className="ops-person">{record.customer?.trim() || "—"}</p>
                {record.customer_email ? <p className="ops-contact">{record.customer_email}</p> : null}
                {record.customer_phone ? <p className="ops-contact">{record.customer_phone}</p> : null}
                {location ? <p className="ops-contact">{location}</p> : null}
                {record.kind === "product" && address ? <p className="ops-address">{address}</p> : null}
              </section>

              <section className="ops-card">
                <h2>Activity</h2>
                {events.length === 0 && !record.notes ? (
                  <p className="ops-empty">No staff notes yet.</p>
                ) : (
                  <ul className="ops-activity">
                    {events.map((event) => (
                      <li key={event.id}>
                        <p>{event.notes || labelize(event.event_type)}</p>
                        <small>{formatWhen(event.created_at)}</small>
                      </li>
                    ))}
                    {record.notes && events.length === 0 ? (
                      <li>
                        <p>{record.notes}</p>
                      </li>
                    ) : null}
                  </ul>
                )}
                <form
                  className="ops-note"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!note.trim()) return;
                    patch({ note: note.trim() }, "note");
                  }}
                >
                  <label htmlFor="ops-note">Internal note</label>
                  <textarea
                    id="ops-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                  />
                  <button className="ops-btn ops-btn--primary" type="submit" disabled={saving === "note" || !note.trim()}>
                    {saving === "note" ? "Posting…" : "Add note"}
              </button>
                </form>
              </section>
            </aside>
            </div>
        </>
      ) : null}
    </div>
  );
}

export default function AdminOrderDetailsPage() {
  return (
    <Suspense fallback={<p className="ops-state">Loading order…</p>}>
      <OrderDetailsScreen />
    </Suspense>
  );
}
