import { usePathname } from "next/navigation";
import { useEffect } from "react"



export function Main({children}) {

    return (
        <>
            <main>
                {
                    children
                }
            </main>
        </>
    )
}
