"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultationGateModal({ open, onClose, onContinueWithout }) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="consultation-gate-backdrop"
      onClick={onClose}
    >
      <div
        className="consultation-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-gate-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="consultation-gate__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <p className="consultation-gate__eyebrow">Before you book</p>
        <h2 id="consultation-gate-title">Start with a consultation</h2>
        <p className="consultation-gate__copy">
          A consultation helps us understand your concern and recommend the
          service that will actually help. Book one first, or continue without
          a consultation.
        </p>
        <div className="consultation-gate__actions">
          <button
            type="button"
            className="consultation-gate__primary"
            onClick={() => router.push("/consultation")}
          >
            Book a consultation
          </button>
          <button
            type="button"
            className="consultation-gate__secondary"
            onClick={onContinueWithout}
          >
            Continue with no consultation
          </button>
        </div>
      </div>
    </div>
  );
}
