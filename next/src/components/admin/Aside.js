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
        { name: "Dashboard", svg: IoGridOutline, path: "/dashboard" },
        { name: "Customers", svg: IoPeopleOutline, path: "/customers" },
        { name: "Orders", svg: IoCartOutline, path: "/orders" },
        { name: "Appointments", svg: IoCalendarOutline, path: "/appointments" },
        { name: "Services", svg: IoSparklesOutline, path: "/services" },
        { name: "Products", svg: IoBagHandleOutline, path: "/products" },
        { name: "Catalog", svg: IoPricetagsOutline, path: "/catalog" },
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