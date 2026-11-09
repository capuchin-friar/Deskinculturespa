"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IoGridOutline,
    IoPeopleOutline,
    IoCartOutline,
    IoPricetagsOutline,
    IoCalendarOutline,
    IoSettingsOutline,
} from "react-icons/io5";

const navs = [
    { name: "Dashboard", svg: IoGridOutline, path: "" },
    { name: "Catalog", svg: IoPricetagsOutline, path: "catalog" },
    { name: "Orders", svg: IoCartOutline, path: "orders" },
    { name: "Users", svg: IoPeopleOutline, path: "users" },
    { name: "Availability", svg: IoCalendarOutline, path: "availability" },
    { name: "Settings", svg: IoSettingsOutline, path: "profile" },
];

function hrefFor(path) {
    return path ? `/admin/${path}` : "/admin";
}

function isNavActive(pathname, path) {
    if (!path) return pathname === "/admin" || pathname === "/admin/";
    if (path === "catalog") {
        return pathname.startsWith("/admin/catalog") || pathname.startsWith("/admin/create");
    }
    if (path === "orders") return pathname.startsWith("/admin/orders");
    if (path === "users") return pathname.startsWith("/admin/users");
    if (path === "availability") return pathname.startsWith("/admin/availability");
    if (path === "profile") return pathname.startsWith("/admin/profile");
    return pathname === `/admin/${path}` || pathname.startsWith(`/admin/${path}/`);
}

function NavLinks() {
    const pathname = usePathname();

    return navs.map(({ name, path, svg: Icon }) => {
        const href = hrefFor(path);
        const active = isNavActive(pathname, path);
        return (
            <Link
                key={href}
                href={href}
                className={`admin-nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
            >
                <span className="admin-nav-link__icon">
                    <Icon />
                </span>
                <span className="admin-nav-link__label">{name}</span>
            </Link>
        );
    });
}

export function Aside() {
    return (
        <>
            <aside className="admin-aside">
                <section className="admin-aside-brand">
                    <span>
                        <img src="/deskinculture_logo.png" alt="DeSkinCulture logo" />
                    </span>
                    <span>
                        <p>Deskinculture</p>
                        <small>Admin</small>
                    </span>
                </section>
                <nav className="admin-aside-nav" aria-label="Admin">
                    <NavLinks />
                </nav>
            </aside>
            <nav className="admin-bottom-nav" aria-label="Admin">
                <NavLinks />
            </nav>
        </>
    );
}
