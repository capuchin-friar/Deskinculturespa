"use client"

import { Aside } from "@/src/components/admin/Aside"
import { Main } from "@/src/components/admin/Main"
import { Header } from "@/src/components/admin/Header"
import AdminGate from "@/src/components/admin/AdminGate"
import "./styles/admin/xxl.css";
import "./styles/admin/s.css";
import "./styles/admin/paidItem.css";
import { usePathname } from "next/navigation";

export default function Admin({ children }) {
    const path = usePathname();
    const isAuthPage = path === "/admin/login" || path === "/admin/signup";
    const isProfile = path === "/admin/profile" || path.startsWith("/admin/profile/");

    if (isAuthPage) {
        return <main className="customer-auth-shell">{children}</main>;
    }

    const shell = isProfile ? (
        <>
            <div style={{ width: "100%" }}>
                {children}
            </div>
            <Aside />
        </>
    ) : (
        <>
            <Aside />
            <div className="admin-content">
                <Header />
                <Main children={children} />
            </div>
        </>
    );

    return (
        <AdminGate>
            <div className={`admin-cnt${isProfile ? " admin-cnt--profile" : ""}`}>
                {shell}
            </div>
        </AdminGate>
    );
}
