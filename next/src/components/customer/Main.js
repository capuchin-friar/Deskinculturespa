import { usePathname } from "next/navigation";
import { useEffect } from "react"



export function Main({children}) {

    return (
        <>
            <main className="customer-main">
                {
                    children
                }
            </main>
        </>
    )
}
