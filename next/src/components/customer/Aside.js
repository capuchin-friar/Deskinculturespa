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
    IoFilterOutline,
} from "react-icons/io5";


export function Aside() {

    return (
        <>
            <aside className="customer-aside">
                {/* <section className="filter-headline">
                    <span>
                        <IoFilterOutline size={25} fontWeight={"bold"} />
                    </span>
                    <span>
                        <p>Filter</p>
                    </span>
                </section> */}
                <br />
                <section>
                    <label style={{fontWeight: "500"}} htmlFor="">Price </label>
                    <div className="price-range-filter">

                        <div className="input-filter-cnt">
                            {/* <label htmlFor="">Min</label> */}
                            <input type="number" name="" placeholder="Min" id="" />
                        </div>
                        <div className="input-filter-cnt">
                            {/* <label htmlFor="">Max</label> */}
                            <input type="number" name="" placeholder="Max" id="" />
                        </div>
                    </div>
                </section>
            </aside>
        </>
    )
}