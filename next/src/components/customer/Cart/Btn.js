"use client";

import { useRouter } from "next/navigation";

const Btn = ({subTotal,url}) => {
    const router = useRouter();

    return ( 
        <>
            <button className="shadow-sm" onClick={() => router.push("/store/checkout")}>
                <span>Proceed with Checkout</span>
                <br />
            </button>
        </>
     );
}
 
export default Btn;
