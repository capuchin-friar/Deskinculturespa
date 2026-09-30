"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { baseApi } from "../../app/api/shared/config";

const activeStatuses = new Set(["pending", "confirmed"]);

function errorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default function useConsultationToggler() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const pending = useRef(new Set());

  const refreshAppointments = useCallback(async () => {
    const { data } = await baseApi.get("customers/appointments");
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error(data?.message || "Could not load your consultations.");
    }
    setAppointments(data.data);
    setLoadError("");
    return data.data;
  }, []);

  useEffect(() => {
    let mounted = true;
    baseApi.get("customers/appointments")
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.data)) throw new Error(data?.message || "Could not load your consultations.");
        if (mounted) setAppointments(data.data);
      })
      .catch((error) => {
        if (mounted) setLoadError(errorMessage(error, "Sign in to manage your consultations."));
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const activeAppointments = appointments.filter((appointment) => activeStatuses.has(appointment.status));
  const isBooked = useCallback((offeringId) => activeAppointments.some(
    (appointment) => String(appointment.offering_id) === String(offeringId),
  ), [activeAppointments]);

  const toggleAppointment = useCallback(async ({ offeringId, consultationSlug, consultationName } = {}) => {
    const id = String(offeringId ?? "");
    if (!/^\d+$/.test(id)) throw new Error("Choose a valid consultation option.");
    if (pending.current.has(id)) return false;
    pending.current.add(id);
    try {
      const existing = activeAppointments.find((appointment) => String(appointment.offering_id) === id);
      if (existing) {
        if (existing.status !== "pending") throw new Error("This consultation is confirmed and cannot be removed here.");
        const { data } = await baseApi.delete(`customers/appointments/${existing.id}`);
        if (!data?.success) throw new Error(data?.message || "Could not remove this consultation.");
        setAppointments((current) => current.filter((appointment) => String(appointment.id) !== String(existing.id)));
        return true;
      }
      const { data } = await baseApi.post("customers/appointments", {
        offering_id: id,
        consultation_slug: consultationSlug,
        consultation_name: consultationName,
      });
      if (!data?.success) throw new Error(data?.message || "Could not book this consultation.");
      await refreshAppointments();
      return true;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not update this consultation. Please try again."));
    } finally {
      pending.current.delete(id);
    }
  }, [activeAppointments, refreshAppointments]);

  return { appointments, activeAppointments, loading, loadError, isBooked, toggleAppointment, refreshAppointments };
}
