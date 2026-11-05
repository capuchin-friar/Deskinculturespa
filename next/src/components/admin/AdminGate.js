"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSessionContext } from "./AdminSessionContext";

export default function AdminGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/auth/me", { credentials: "same-origin" })
      .then(async (response) => {
        if (!mounted) return;
        if (!response.ok) {
          const next = pathname?.startsWith("/admin") ? pathname : "/admin";
          router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
          return;
        }
        const result = await response.json();
        setAdmin(result.data || null);
      })
      .catch(() => {
        if (mounted) {
          const next = pathname?.startsWith("/admin") ? pathname : "/admin";
          router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
        }
      });
    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (!admin) {
    return <div className="admin-cnt" style={{ minHeight: "100vh", background: "#f7f8f5" }} />;
  }

  return (
    <AdminSessionContext.Provider value={admin}>
      {children}
    </AdminSessionContext.Provider>
  );
}
