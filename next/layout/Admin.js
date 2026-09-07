"use client"

import { Aside } from "@/src/components/admin/Aside"
import { Main } from "@/src/components/admin/Main"
import { Header } from "@/src/components/admin/Header"


/**
 * @Styles import
 */
import "./styles/xxl.css";
import "./styles/paidItem.css";
import { usePathname } from "next/navigation";






export default function Admin({ children }) {

    let path = usePathname();


    return (
        <>
            <div className="admin-cnt">

                {
                    path.split("/").splice(-1)[0] !== "profile" ?
                        <>
                            <Aside />
                            <div className="admin-content">
                                <Header />
                                <Main children={children} />
                            </div>
                        </> : <>
                            <div style={{width: "100%"}}>
                                {children}
                            </div>
                        </>
                }
            </div>
        </>
    )
}