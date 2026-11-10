"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { FiBookmark, FiCalendar, FiPackage, FiUser } from "react-icons/fi";
import { useAccountNav } from "@/src/components/customer/AccountNavContext";

const ACCOUNT_LINKS = [
  { name: "Appointments", id: "appointments", Icon: FiCalendar },
  { name: "Bookings", id: "bookings", Icon: FiBookmark },
  { name: "Packages", id: "packages", Icon: FiPackage },
  { name: "Orders", id: "orders", Icon: FiPackage },
];

export function AccountNav() {
  const pathname = usePathname();
  const { open, close } = useAccountNav();
  const section = String(pathname || "").split("/")[2] || "";

  return (
    <>
      <button
        type="button"
        className={`customer-account-nav-backdrop${open ? " is-open" : ""}`}
        aria-label="Close account menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <aside
        id="customer-account-nav"
        className={`customer-account-nav${open ? " is-open" : ""}`}
        aria-label="Account navigation"
      >
        <div className="customer-account-nav__top">
          <p>Account</p>
          <button
            type="button"
            className="customer-account-nav__close"
            aria-label="Close account menu"
            onClick={close}
          >
            <IoClose size={22} aria-hidden="true" />
          </button>
        </div>
        <Link
          href="/customer/account"
          aria-current={section === "account" ? "page" : undefined}
          onClick={close}
        >
          <FiUser aria-hidden="true" />
          My Account
        </Link>
        <hr />
        {ACCOUNT_LINKS.map(({ name, id, Icon }) => (
          <Link
            href={`/customer/${id}`}
            key={id}
            aria-current={section === id ? "page" : undefined}
            onClick={close}
          >
            <Icon aria-hidden="true" />
            {name}
          </Link>
        ))}
      </aside>
    </>
  );
}
