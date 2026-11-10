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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const value = useMemo(
    () => ({
      enabled: true,
      open,
      toggle: () => setOpen((current) => !current),
      close: () => setOpen(false),
    }),
    [open],
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
