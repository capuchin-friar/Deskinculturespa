"use client"

import { Header } from "@/src/components/customer/Header"
import { Main } from "@/src/components/customer/Main"

// import { Aside } from "../../src/components/admin/Aside"
// import { Main } from "../../src/components/admin/Main"
// import { Header } from "../../src/components/admin/Header"


/**
 * @Styles import
 */

import "./styles/customer/xxl.css";
import "./styles/customer/mega-header.css"




export default function Customer({children}) {

    return(
        <>
            <div className="customer-cnt">

                {/* <Aside /> */}
                <div className="customer-content">
                    <Header />
                    <Main children={children} />
                </div>
            </div>
        </>
    )
}