"use client"

import { Aside } from "@/src/components/admin/Aside"
import { Main } from "@/src/components/admin/Main"
import { Header } from "@/src/components/admin/Header"


/**
 * @Styles import
 */
import "./styles/xxl.css";
import "./styles/paidItem.css";






export default function Admin({children}) {

    return(
        <>
            <div className="admin-cnt">

                <Aside />
                <div className="admin-content">
                    <Header />
                    <Main children={children} />
                </div>
            </div>
        </>
    )
}