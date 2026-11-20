"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { baseApi } from "../../app/api/shared/config";
import {
  isPaidConsultation,
  readConsultedParam,
} from "../utils/consultationReferral";

const SKIP_KEY = "deskinculture_skip_consultation";

function referralAllowsServices(rows, consultedId) {
  if (!consultedId) return false;
  return (Array.isArray(rows) ? rows : []).some(
    (row) =>
      String(row?.id) === String(consultedId) && isPaidConsultation(row),
  );
}

export default function useConsultationGate() {
  const searchParams = useSearchParams();
  const consultedId = readConsultedParam(searchParams);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const pendingRef = useRef(null);
  const allowedRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    allowedRef.current = allowed;
  }, [allowed]);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    let mounted = true;

    if (typeof window !== "undefined" && sessionStorage.getItem(SKIP_KEY) === "1") {
      allowedRef.current = true;
      readyRef.current = true;
      setAllowed(true);
      setReady(true);
      return undefined;
    }

    if (!consultedId) {
      allowedRef.current = false;
      readyRef.current = true;
      setAllowed(false);
      setReady(true);
      return undefined;
    }

    setReady(false);
    readyRef.current = false;

    baseApi
      .get("customers/appointments")
      .then(({ data }) => {
        if (!mounted) return;
        const nextAllowed = referralAllowsServices(data?.data, consultedId);
        allowedRef.current = nextAllowed;
        readyRef.current = true;
        setAllowed(nextAllowed);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        allowedRef.current = false;
        readyRef.current = true;
        setAllowed(false);
        setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [consultedId]);

  const close = useCallback(() => {
    pendingRef.current = null;
    setOpen(false);
  }, []);

  const requireConsultation = useCallback((next) => {
    if (allowedRef.current) {
      next?.();
      return;
    }
    pendingRef.current = next;
    if (!readyRef.current) return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (allowed && pendingRef.current) {
      const next = pendingRef.current;
      pendingRef.current = null;
      next?.();
      return;
    }
    if (!allowed && pendingRef.current) setOpen(true);
  }, [allowed, ready]);

  const continueWithoutConsultation = useCallback(() => {
    sessionStorage.setItem(SKIP_KEY, "1");
    allowedRef.current = true;
    setAllowed(true);
    const next = pendingRef.current;
    pendingRef.current = null;
    setOpen(false);
    next?.();
  }, []);

  return {
    allowed,
    consultedId,
    open,
    requireConsultation,
    close,
    continueWithoutConsultation,
  };
}
