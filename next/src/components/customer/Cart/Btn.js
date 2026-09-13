import { useState } from "react";

const Btn = ({subTotal,url}) => {
    // let navigate = useNavigate();

    return ( 
        <>
            <button className="shadow-sm" onClick={e => window.location.href = (`/store/checkout/`)}>
                <span>Proceed with Checkout</span>
                <br />
            </button>
        </>
     );
}
 
export default Btn;