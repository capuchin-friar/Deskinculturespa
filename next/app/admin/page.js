"use client"

import { Aside } from "../../src/components/admin/Aside"
import { Body } from "../../src/components/admin/Body"
import { Header } from "../../src/components/admin/Header"


/**
 * @Styles import
 */
import "./styles/xxl.css";






export default function Admin() {

    return(
        <>
            <div className="admin-cnt">

                <Aside />
                <div className="admin-content">
                    <Header />
                    <Body />
                </div>
            </div>
        </>
    )
}