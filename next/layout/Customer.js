"use client"

import { Header } from "@/src/components/customer/Header"
import { Main } from "@/src/components/customer/Main"
import { Footer } from "@/src/components/customer/Footer"

// import { Aside } from "../../src/components/admin/Aside"
// import { Main } from "../../src/components/admin/Main"
// import { Header } from "../../src/components/admin/Header"


/**
 * @Styles import
 */

import "./styles/customer/xxl.css";
import "./styles/customer/why.css";
import "./styles/customer/footer.css"
import "./styles/customer/mega-header.css"
import "./styles/customer/mobile.css"
import "./styles/customer/tablet.css"
import "./styles/customer/ipad.css"
import "./styles/customer/mobile-menu.css"
import { Aside } from "@/src/components/customer/Aside";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { baseApi } from "@/app/api/shared/config";
import { useDispatch } from "react-redux";
import { set_cart } from "@/redux/customer/cart";



export default function Customer({ children }) {

    let pathname = usePathname();
    let isAuthPage = pathname === "/login" || pathname === "/register";
    let path = pathname === "/store" || pathname.startsWith("/store/");
    let [storeFilterOpen, setStoreFilterOpen] = useState(false);
    let isStoreFilterOpen = path && storeFilterOpen;

    let dispatch = useDispatch();
    useEffect(() => {
        if (isAuthPage) return;
        (async () => {
            try {
                const { data } = await baseApi.get("/cart");

                if (!data.success) {
                    throw new Error("Error: ", data.message);
                }
                dispatch(set_cart(data.data));
            } catch (error) {
                console.log(error);
            }
        })();

    }, [pathname, dispatch, isAuthPage]);

    useEffect(() => {
        if (!isStoreFilterOpen) return undefined;

        const bodyStyle = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
            overflow: document.body.style.overflow,
        };
        const htmlOverflow = document.documentElement.style.overflow;
        const scrollY = window.scrollY;
        const closeFilter = () => setStoreFilterOpen(false);
        const handleKeyDown = (event) => {
            if (event.key === "Escape") closeFilter();
        };
        const handleResize = () => {
            if (window.innerWidth > 480) closeFilter();
        };

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleResize);

        return () => {
            Object.assign(document.body.style, bodyStyle);
            document.documentElement.style.overflow = htmlOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleResize);
            window.scrollTo(0, scrollY);
        };
    }, [isStoreFilterOpen]);


    if (isAuthPage) {
        return <main className="customer-auth-shell">{children}</main>;
    }

    return (
        <>
            <div className="customer-cnt">


                <div className="customer-content">
                    <Header
                        storeFilterEnabled={path}
                        storeFilterOpen={isStoreFilterOpen}
                        onToggleStoreFilter={() => setStoreFilterOpen((open) => !open)}
                        onCloseStoreFilter={() => setStoreFilterOpen(false)}
                    />
                    <div className="customer-body" style={{marginTop: "60px"}}>
                        {
                            path && (
                                <>
                                    <button
                                        type="button"
                                        className={`customer-store-filter-backdrop${isStoreFilterOpen ? " is-open" : ""}`}
                                        aria-label="Close store filters"
                                        aria-hidden={!isStoreFilterOpen}
                                        tabIndex={isStoreFilterOpen ? 0 : -1}
                                        onClick={() => setStoreFilterOpen(false)}
                                    />
                                    <Aside isMobileFilterOpen={isStoreFilterOpen} />
                                </>
                            )
                        }
                        <Main>{children}</Main>
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    )
}
