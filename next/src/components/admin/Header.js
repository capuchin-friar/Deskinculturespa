"use client";

import { IoPersonOutline } from "react-icons/io5";
import { useAdminSession } from "./AdminSessionContext";

function displayName(admin) {
  const full = [admin?.fname, admin?.lname].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (admin?.email) return admin.email;
  return "Admin";
}

function shortName(admin) {
  const first = String(admin?.fname || "").trim();
  const last = String(admin?.lname || "").trim();
  if (first && last) return `${first}. ${last.charAt(0).toUpperCase()}`;
  return displayName(admin);
}

export function Header() {
  const admin = useAdminSession();
  const name = displayName(admin);
  const short = shortName(admin);

  return (
    <>
      <header className="admin-header">
        <div className="admin-welcome-box">
          <h3>Welcome back, {name} 👋</h3>
          <small>Here's what's happening with your spa business today!</small>
        </div>

        <button className="right" onClick={() => {
          window.open("/admin/profile", "_blank");
        }}>
          <span>
            <IoPersonOutline height={20} width={20} />
          </span>
          &nbsp;
          &nbsp;
          <span>
            <small>Admin</small>
            <small>{short}</small>
          </span>
        </button>
      </header>
    </>
  );
}
