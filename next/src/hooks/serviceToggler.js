"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { baseApi } from "../../app/api/shared/config";

const activeStatuses = new Set(["pending", "confirmed"]);

function responseMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.data || error?.message || fallback;
}

export default function useServiceToggler() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyServiceIds, setBusyServiceIds] = useState([]);
  const pendingServiceIds = useRef(new Set());

  const refreshBookings = useCallback(async () => {
    const { data } = await baseApi.get("customers/bookings");
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error(data?.message || "Could not load your bookings.");
    }
    setBookings(data.data);
    setLoadError("");
    return data.data;
  }, []);

  useEffect(() => {
    let mounted = true;

    baseApi.get("customers/bookings")
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error(data?.message || "Could not load your bookings.");
        }
        if (mounted) {
          setBookings(data.data);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error("Load bookings error:", error);
          setLoadError(responseMessage(error, "Could not load your bookings. Sign in and try again."));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getBooking = useCallback((serviceId) => bookings.find(
    (booking) => String(booking.service_id) === String(serviceId) && activeStatuses.has(booking.status),
  ), [bookings]);

  const isBooked = useCallback((serviceId) => Boolean(getBooking(serviceId)), [getBooking]);

  const toggleService = useCallback(async ({ serviceId } = {}) => {
    const id = String(serviceId ?? "");
    if (!/^\d+$/.test(id)) throw new Error("A valid service is required.");
    if (pendingServiceIds.current.has(id)) return false;

    pendingServiceIds.current.add(id);
    setBusyServiceIds((current) => [...current, id]);

    try {
      const booking = bookings.find(
        (entry) => String(entry.service_id) === id && activeStatuses.has(entry.status),
      );

      if (booking) {
        if (booking.status !== "pending") {
          throw new Error("This booking is confirmed and cannot be removed here.");
        }

        const { data } = await baseApi.delete(`customers/bookings/${booking.id}`);
        if (!data?.success) throw new Error(data?.message || "Could not remove this booking.");
        setBookings((current) => current.filter((entry) => String(entry.id) !== String(booking.id)));
        return true;
      }

      const { data } = await baseApi.post("customers/bookings", {
        service_id: id,
      });
      if (!data?.success || !data.data) throw new Error(data?.message || "Could not add this service to your bookings.");

      await refreshBookings();
      return true;
    } catch (error) {
      console.error("Update service booking error:", error);
      throw new Error(responseMessage(error, "Could not update this booking. Please try again."));
    } finally {
      pendingServiceIds.current.delete(id);
      setBusyServiceIds((current) => current.filter((busyId) => busyId !== id));
    }
  }, [bookings, refreshBookings]);

  const scheduleBookings = useCallback(async ({ scheduledAt } = {}) => {
    const pendingBookings = bookings.filter((entry) => activeStatuses.has(entry.status));
    if (!pendingBookings.length) throw new Error("No active service bookings were found.");
    const serviceIds = pendingBookings.map((entry) => String(entry.service_id));
    if (serviceIds.some((id) => pendingServiceIds.current.has(id))) return false;
    serviceIds.forEach((id) => pendingServiceIds.current.add(id));
    setBusyServiceIds((current) => [...new Set([...current, ...serviceIds])]);
    try {
      const date = new Date(scheduledAt);
      if (!scheduledAt || Number.isNaN(date.getTime()) || date <= new Date()) {
        throw new Error("Choose a valid future date and time.");
      }
      const { data } = await baseApi.post("customers/bookings/schedule", { scheduled_at: date.toISOString() });
      if (!data?.success || !Array.isArray(data.data)) throw new Error(data?.message || "Could not schedule all services.");
      const scheduledById = new Map(data.data.map((entry) => [String(entry.id), entry]));
      setBookings((current) => {
        const currentIds = new Set(current.map((entry) => String(entry.id)));
        return [
          ...current.map((entry) => scheduledById.has(String(entry.id)) ? { ...entry, ...scheduledById.get(String(entry.id)) } : entry),
          ...data.data.filter((entry) => !currentIds.has(String(entry.id))),
        ];
      });
      return true;
    } catch (error) {
      console.error("Schedule services error:", error);
      throw new Error(responseMessage(error, "Could not schedule all services. Please try again."));
    } finally {
      serviceIds.forEach((id) => pendingServiceIds.current.delete(id));
      setBusyServiceIds((current) => current.filter((busyId) => !serviceIds.includes(busyId)));
    }
  }, [bookings]);

  const isBusy = useCallback((serviceId) => busyServiceIds.includes(String(serviceId)), [busyServiceIds]);

  return { bookings, loading, loadError, getBooking, isBooked, isBusy, toggleService, scheduleBookings, refreshBookings };
}
