"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./styles.css";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const initialDays = weekdays.map((label, day_of_week) => ({ day_of_week, label, is_available: false, start_time: "", end_time: "", slot_interval_minutes: 30, timezone: "Africa/Lagos" }));

export default function AdminAvailabilityPage() {
  const [days, setDays] = useState(initialDays);
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/availability", { credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load your availability.");
        const rules = new Map(result.data.map((rule) => [Number(rule.day_of_week), rule]));
        if (mounted) {
          if (result.data[0]?.timezone) setTimezone(result.data[0].timezone);
          setDays(initialDays.map((day) => ({ ...day, ...(rules.get(day.day_of_week) || {}), is_available: rules.has(day.day_of_week) })));
        }
      })
      .catch((error) => { if (mounted) { setMessage(error.message); setIsError(true); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const updateDay = (index, field, value) => setDays((current) => current.map((day, i) => i === index ? { ...day, [field]: value } : day));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage(""); setIsError(false);
    try {
      const rules = days.filter((day) => day.is_available).map(({ day_of_week, start_time, end_time, slot_interval_minutes }) => ({ day_of_week, start_time, end_time, slot_interval_minutes: Number(slot_interval_minutes), timezone }));
      const response = await fetch("/api/admin/availability", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not save availability.");
      setMessage("Your weekly availability has been saved.");
    } catch (error) { setMessage(error.message || "Could not save availability."); setIsError(true); }
    finally { setSaving(false); }
  };

  return <main className="admin-availability-page">
    <Link className="availability-back" href="/admin/profile">← Back to profile</Link>
    <header><span>BOOKING SETTINGS</span><h1>Weekly availability</h1><p>Choose the days and hours customers can request appointments. Existing appointments are automatically blocked from new requests.</p></header>
    {message && <p className={`availability-message${isError ? " error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>}
    {loading ? <p>Loading your schedule…</p> : <form onSubmit={save}>
      <label className="availability-timezone"><span>Business time zone</span><select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option value="Africa/Lagos">West Africa Time (Lagos)</option><option value="UTC">UTC</option><option value="Europe/London">London</option><option value="America/New_York">New York</option></select></label>
      <div className="availability-day-list">{days.map((day, index) => <section className={`availability-day${day.is_available ? " enabled" : ""}`} key={day.day_of_week}>
        <label className="availability-toggle"><input type="checkbox" checked={Boolean(day.is_available)} onChange={(event) => updateDay(index, "is_available", event.target.checked)} /><span>{day.label}</span></label>
        {day.is_available && <div className="availability-fields">
          <label><span>Opens</span><input type="time" value={day.start_time} required onChange={(event) => updateDay(index, "start_time", event.target.value)} /></label>
          <label><span>Closes</span><input type="time" value={day.end_time} required onChange={(event) => updateDay(index, "end_time", event.target.value)} /></label>
          <label><span>Slot interval</span><select value={day.slot_interval_minutes} onChange={(event) => updateDay(index, "slot_interval_minutes", event.target.value)}>{[15, 20, 30, 45, 60].map((interval) => <option key={interval} value={interval}>{interval} minutes</option>)}</select></label>
        </div>}
      </section>)}</div>
      <button className="availability-save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save availability"}</button>
    </form>}
  </main>;
}
