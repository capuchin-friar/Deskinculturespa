import { useCallback } from "react"
import Link from "next/link";
import {
    IoGridOutline,
    IoPeopleOutline,
    IoCartOutline,
    IoCalendarOutline,
    IoSparklesOutline,
    IoBagHandleOutline,
    IoPricetagsOutline,
    IoSettingsOutline,
} from "react-icons/io5";


export function Aside() {

    const navs = [
        { name: "Dashboard", svg: IoGridOutline, path: "/" },
        { name: "Catalog", svg: IoPricetagsOutline, path: "/catalog" },
        { name: "Orders", svg: IoCartOutline, path: "/orders" },
        { name: "Customers", svg: IoPeopleOutline, path: "/customers" },
        { name: "Settings", svg: IoSettingsOutline, path: "/settings" }
    ];

    const renderAsideOptions = useCallback((navs) => {

        return (
            <>
                {
                    navs.map(({ name, path, svg: Icon }, i) =>

                        <Link key={i} href={`/admin/${path}`}>
                            <span>
                                <Icon />
                            </span>
                            &nbsp;
                            &nbsp;
                            <span>{name}</span>
                        </Link>
                    )
                }
            </>
        )
    })

    return (
        <>
            <aside>
                <section>
                    <span>
                        <img src={null} alt="logo" />
                    </span>
                    <span>
                        <p>Deskinculture</p>
                        <small>Admin</small>
                    </span>
                </section>
                <br />
                <section>
                    {
                        renderAsideOptions(navs)
                    }
                </section>
            </aside>
        </>
    )
}