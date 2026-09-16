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
import { Aside } from "@/src/components/customer/Aside";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { baseApi } from "@/app/api/config";
import { useDispatch } from "react-redux";
import { set_cart } from "@/redux/customer/cart";



export default function Customer({ children }) {

    let pathname = usePathname().split("/");
    let [path, setPath] = useState(false);

    let dispatch = useDispatch();
    useEffect(() => {
        (async () => {
            try {
                const {
                    data,
                    status
                } = await baseApi.get("/cart");

                if (!data.success) {
                    throw new Error("Error: ", data.message);
                }
                dispatch(set_cart(data.data));
                console.log(pathname)
                let path = pathname.length == 2 && pathname[1] === "store";
                setPath(path);
            } catch (error) {
                console.log(error);
            }
        })();

    }, [pathname]);


    return (
        <>
            <div className="customer-cnt">


                <div className="customer-content">
                    <Header />
                    <div className="customer-body">
                        {
                            path && <Aside />
                        }
                        <Main children={children} />
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    )
}