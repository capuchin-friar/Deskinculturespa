"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const AccountNavContext = createContext({
  enabled: false,
  open: false,
  toggle: () => {},
  close: () => {},
});

export function AccountNavProvider({ children }) {
  const pathname = usePathname();
  const enabled = pathname.startsWith("/customer");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const value = useMemo(
    () => ({
      enabled,
      open,
      toggle: () => setOpen((current) => !current),
      close: () => setOpen(false),
    }),
    [enabled, open],
  );

  return (
    <AccountNavContext.Provider value={value}>
      {children}
    </AccountNavContext.Provider>
  );
}

export function useAccountNav() {
  return useContext(AccountNavContext);
}
