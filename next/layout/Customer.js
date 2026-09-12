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




export default function Customer({ children }) {

    let pathname = usePathname().split("/");
    let path = pathname.length == 1 && pathname[1] === "store";
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