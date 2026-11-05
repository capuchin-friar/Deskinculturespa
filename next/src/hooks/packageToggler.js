"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { baseApi } from "../../app/api/shared/config";

const activeStatuses = new Set(["pending", "confirmed"]);

function errorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default function usePackageToggler() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const pending = useRef(new Set());

  const refreshBookings = useCallback(async () => {
    const { data } = await baseApi.get("customers/package-bookings");
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error(data?.message || "Could not load your packages.");
    }
    setBookings(data.data);
    setLoadError("");
    return data.data;
  }, []);

  useEffect(() => {
    let mounted = true;
    baseApi.get("customers/package-bookings")
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error(data?.message || "Could not load your packages.");
        }
        if (mounted) setBookings(data.data);
      })
      .catch((error) => {
        if (mounted) setLoadError(errorMessage(error, "Sign in to manage your packages."));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeBookings = bookings.filter((booking) => activeStatuses.has(booking.status));
  const isBooked = useCallback((packageId) => activeBookings.some(
    (booking) => String(booking.package_id) === String(packageId),
  ), [activeBookings]);

  const togglePackage = useCallback(async ({ packageId } = {}) => {
    const id = String(packageId ?? "");
    if (!/^\d+$/.test(id)) throw new Error("Choose a valid package.");
    if (pending.current.has(id)) return false;
    pending.current.add(id);
    try {
      const existing = activeBookings.find((booking) => String(booking.package_id) === id);
      if (existing) {
        if (existing.status !== "pending") {
          throw new Error("This package is confirmed and cannot be removed here.");
        }
        const { data } = await baseApi.delete(`customers/package-bookings/${existing.id}`);
        if (!data?.success) throw new Error(data?.message || "Could not remove this package.");
        setBookings((current) => current.filter((booking) => String(booking.id) !== String(existing.id)));
        return true;
      }
      const { data } = await baseApi.post("customers/package-bookings", { package_id: id });
      if (!data?.success) throw new Error(data?.message || "Could not book this package.");
      await refreshBookings();
      return true;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not update this package. Please try again."));
    } finally {
      pending.current.delete(id);
    }
  }, [activeBookings, refreshBookings]);

  const schedulePackages = useCallback(async ({ scheduledAt, reference } = {}) => {
    const date = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(date.getTime()) || date <= new Date()) {
      throw new Error("Choose a valid future date and time.");
    }
    try {
      const { data } = await baseApi.post("customers/package-bookings/schedule", {
        scheduled_at: date.toISOString(),
        ...(reference ? { reference } : {}),
      });
      if (!data?.success || !Array.isArray(data.data?.packages)) {
        throw new Error(data?.message || "Could not schedule your package.");
      }
      const updated = data.data.packages;
      const scheduledById = new Map(updated.map((entry) => [String(entry.id), entry]));
      setBookings((current) => {
        const currentIds = new Set(current.map((entry) => String(entry.id)));
        return [
          ...current.map((entry) => (scheduledById.has(String(entry.id)) ? { ...entry, ...scheduledById.get(String(entry.id)) } : entry)),
          ...updated.filter((entry) => !currentIds.has(String(entry.id))),
        ];
      });
      return true;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not schedule your package. Please try again."));
    }
  }, []);

  return {
    bookings,
    activeBookings,
    loading,
    loadError,
    isBooked,
    togglePackage,
    refreshBookings,
    schedulePackages,
  };
}
