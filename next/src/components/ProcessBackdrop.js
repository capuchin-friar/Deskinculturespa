"use client";

import { useEffect, useState } from "react";
import {
    attachProcessBusyInterceptors,
    subscribeProcessBusy,
} from "@/src/hooks/processBusy";

export default function ProcessBackdrop() {
    const [state, setState] = useState({ busy: false, label: "Please wait" });

    useEffect(() => {
        attachProcessBusyInterceptors();
        return subscribeProcessBusy(setState);
    }, []);

    useEffect(() => {
        if (!state.busy) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        window.addEventListener("keydown", onKeyDown, true);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKeyDown, true);
        };
    }, [state.busy]);

    if (!state.busy) return null;

    return (
        <div
            className="process-backdrop"
            role="alertdialog"
            aria-modal="true"
            aria-busy="true"
            aria-label={state.label}
        >
            <span className="process-backdrop__spinner" aria-hidden="true" />
            <p>{state.label}…</p>
        </div>
    );
}
