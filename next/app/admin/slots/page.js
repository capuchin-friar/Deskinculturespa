"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IoCalendarOutline, IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import AdminLoader from "@/src/components/admin/AdminLoader";
import "./styles/xxl.css";
import "./styles/tablet.css";
import "./styles/ipad.css";
import "./styles/mobile.css";

const LAGOS = "Africa/Lagos";
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const KIND_OPTIONS = [
    { name: "All slots", value: "all" },
    { name: "Bookings", value: "bookings" },
    { name: "Consultations", value: "consultations" },
    { name: "Packages", value: "packages" },
];

function lagosYmd(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: LAGOS,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function parseYmd(ymd) {
    const [year, month, day] = String(ymd).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 11, 0, 0));
}

function addDaysYmd(ymd, days) {
    const next = parseYmd(ymd);
    next.setUTCDate(next.getUTCDate() + days);
    return lagosYmd(next);
}

function startOfLagosWeek(date = new Date()) {
    const ymd = lagosYmd(date);
    const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: LAGOS,
        weekday: "short",
    }).format(parseYmd(ymd));
    const offset = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[weekday] ?? 0;
    return addDaysYmd(ymd, -offset);
}

function formatRangeLabel(weekStart) {
    const weekEnd = addDaysYmd(weekStart, 6);
    const start = parseYmd(weekStart);
    const end = parseYmd(weekEnd);
    const startMonth = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(start);
    const endMonth = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(end);
    const startDay = start.getUTCDate();
    const endDay = end.getUTCDate();
    const year = end.getUTCFullYear();
    if (startMonth === endMonth) return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
}

function formatSlotDate(ymd) {
    if (!ymd) return "";
    const date = parseYmd(ymd);
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function formatClock(hhmm) {
    if (!hhmm) return "";
    const [hours, minutes] = String(hhmm).split(":").map(Number);
    if (!Number.isFinite(hours)) return hhmm;
    const date = new Date(Date.UTC(2020, 0, 1, hours, minutes || 0));
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
    }).format(date).replace(" ", "").toLowerCase();
}

function customerInitial(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "C";
    return trimmed.charAt(0).toUpperCase();
}

function firstName(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "Customer";
    return trimmed.split(/\s+/)[0];
}

function kindLabel(kind) {
    if (kind === "consultation") return "Consultation";
    if (kind === "package") return "Package";
    return "Booking";
}

function orderKind(kind) {
    if (kind === "consultation") return "appointment";
    if (kind === "package") return "package";
    return "service";
}

function resourceKey(slot) {
    return `${slot.kind}:${String(slot.title || "Untitled").toLowerCase()}`;
}

export default function AdminSlotsPage() {
    const [kind, setKind] = useState("all");
    const [weekStart, setWeekStart] = useState(() => startOfLagosWeek());
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);

    const days = useMemo(
        () => WEEKDAYS.map((label, index) => {
            const date = addDaysYmd(weekStart, index);
            return { label, date, day: Number(date.slice(-2)) };
        }),
        [weekStart],
    );

    const today = lagosYmd();
    const isThisWeek = weekStart === startOfLagosWeek();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const from = `${weekStart}T00:00:00+01:00`;
                const to = `${addDaysYmd(weekStart, 7)}T00:00:00+01:00`;
                const query = new URLSearchParams({ kind, from, to });
                const response = await fetch(`/api/admin/slots?${query}`, {
                    credentials: "include",
                });
                const result = await response.json();
                if (cancelled) return;
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Could not load slots.");
                }
                setSlots(Array.isArray(result.data) ? result.data : []);
            } catch (err) {
                if (!cancelled) {
                    setSlots([]);
                    setError(err?.message || "Could not load slots.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [kind, weekStart]);

    useEffect(() => {
        if (!selectedSlot) return undefined;
        const onKeyDown = (event) => {
            if (event.key === "Escape") setSelectedSlot(null);
        };
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [selectedSlot]);

    const resources = useMemo(() => {
        const map = new Map();
        for (const slot of slots) {
            const key = resourceKey(slot);
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    title: slot.title || "Untitled",
                    kind: slot.kind,
                    image_url: slot.image_url,
                });
            }
        }
        return [...map.values()];
    }, [slots]);

    const slotsByResourceDay = useMemo(() => {
        const grouped = new Map();
        for (const slot of slots) {
            const key = `${resourceKey(slot)}|${slot.slot_date}`;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(slot);
        }
        return grouped;
    }, [slots]);

    return (
        <div className="slots-page">
            <header className="slots-header">
                <h1>Slots</h1>
                <div className="slots-header-controls">
                    <label className="slots-type-filter">
                        <span className="slots-type-filter__label">Show</span>
                        <select
                            aria-label="Slot type"
                            value={kind}
                            onChange={(event) => setKind(event.target.value)}
                        >
                            {KIND_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="slots-week-nav">
                        <span className="slots-week-nav__range">
                            {isThisWeek ? "This week" : "Week of"}
                        </span>
                        <button
                            type="button"
                            aria-label="Previous week"
                            onClick={() => setWeekStart((current) => addDaysYmd(current, -7))}
                        >
                            <IoChevronBack />
                        </button>
                        <strong>{formatRangeLabel(weekStart)}</strong>
                        <button
                            type="button"
                            aria-label="Next week"
                            onClick={() => setWeekStart((current) => addDaysYmd(current, 7))}
                        >
                            <IoChevronForward />
                        </button>
                        <button
                            type="button"
                            className="slots-week-nav__today"
                            aria-label="This week"
                            onClick={() => setWeekStart(startOfLagosWeek())}
                        >
                            <IoCalendarOutline />
                        </button>
                    </div>
                </div>
            </header>

            {loading ? <AdminLoader label="Loading slots" /> : null}
            {!loading && error ? <p className="slots-error">{error}</p> : null}

            {!loading && !error ? (
                <div className="slots-board">
                    <div className="slots-grid" role="table" aria-label="Booked time slots">
                        <div className="slots-grid__head" role="row">
                            <div className="slots-grid__resource-h" role="columnheader">
                                Offering
                            </div>
                            {days.map((day) => (
                                <div
                                    key={day.date}
                                    className={`slots-grid__day-h${day.date === today ? " is-today" : ""}`}
                                    role="columnheader"
                                >
                                    <span>{day.label}</span>
                                    <strong>{day.day}</strong>
                                </div>
                            ))}
                        </div>

                        {resources.length === 0 ? (
                            <div className="slots-empty" role="row">
                                <p>No booked slots this week for the selected type.</p>
                            </div>
                        ) : (
                            resources.map((resource) => (
                                <div className="slots-grid__row" role="row" key={resource.key}>
                                    <div className="slots-grid__resource" role="rowheader">
                                        <p>{resource.title}</p>
                                        <small>{kindLabel(resource.kind)}</small>
                                    </div>
                                    {days.map((day) => {
                                        const cellSlots = slotsByResourceDay.get(`${resource.key}|${day.date}`) || [];
                                        return (
                                            <div
                                                key={`${resource.key}-${day.date}`}
                                                className={`slots-grid__cell${day.date === today ? " is-today" : ""}`}
                                                role="cell"
                                            >
                                                {cellSlots.map((slot) => (
                                                    <button
                                                        type="button"
                                                        key={`${slot.kind}-${slot.id}`}
                                                        className={`slots-pill slots-pill--${slot.kind}`}
                                                        title={`${slot.customer || "Customer"} · ${slot.title} · ${formatClock(slot.slot_time)}`}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {slot.image_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={slot.image_url} alt="" />
                                                        ) : (
                                                            <span aria-hidden="true">
                                                                {customerInitial(slot.customer)}
                                                            </span>
                                                        )}
                                                        <em>{firstName(slot.customer)}</em>
                                                        <time dateTime={`${slot.slot_date}T${slot.slot_time}`}>
                                                            {formatClock(slot.slot_time)}
                                                        </time>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : null}

            {selectedSlot ? (
                <div
                    className="slots-modal"
                    role="presentation"
                    onClick={() => setSelectedSlot(null)}
                >
                    <div
                        className="slots-modal__dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="slots-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <header className="slots-modal__header">
                            <div>
                                <p className="slots-modal__kind">{kindLabel(selectedSlot.kind)}</p>
                                <h2 id="slots-modal-title">{selectedSlot.title || "Scheduled slot"}</h2>
                            </div>
                            <button
                                type="button"
                                className="slots-modal__close"
                                aria-label="Close slot details"
                                onClick={() => setSelectedSlot(null)}
                            >
                                <IoClose />
                            </button>
                        </header>

                        <dl className="slots-modal__details">
                            <div>
                                <dt>Date</dt>
                                <dd>{formatSlotDate(selectedSlot.slot_date) || "Not set"}</dd>
                            </div>
                            <div>
                                <dt>Time</dt>
                                <dd>
                                    {formatClock(selectedSlot.slot_time) || "Not set"}
                                    <span> West Africa Time</span>
                                </dd>
                            </div>
                            <div>
                                <dt>Customer</dt>
                                <dd>{selectedSlot.customer?.trim() || "Customer"}</dd>
                            </div>
                            <div>
                                <dt>Duration</dt>
                                <dd>
                                    {selectedSlot.duration_minutes
                                        ? `${selectedSlot.duration_minutes} minutes`
                                        : "Not set"}
                                </dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>{String(selectedSlot.status || "pending")}</dd>
                            </div>
                        </dl>

                        <div className="slots-modal__actions">
                            <button
                                type="button"
                                className="slots-modal__secondary"
                                onClick={() => setSelectedSlot(null)}
                            >
                                Close
                            </button>
                            <Link
                                className="slots-modal__primary"
                                href={`/admin/orders/${selectedSlot.id}?kind=${orderKind(selectedSlot.kind)}`}
                            >
                                View order details
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
