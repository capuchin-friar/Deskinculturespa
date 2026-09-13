import {
    useDispatch,
    useSelector
} from "react-redux";
import {
    useEffect,
    useState
} from "react";
import { IoArrowForward, IoTrashBinOutline } from "react-icons/io5";
import {
    useNavigate
} from "react-router-dom";
import { set_cart } from "../../../../redux/customer/cart";
import Thumbnail from "../../Thumbnail";
import axios from "axios";
import { baseApi } from "../../../../app/api/config";
// import { buyer_overlay_setup } from "@/files/reusable.js/overlay-setup";
// import { open_notice } from "@/files/reusable.js/notice";

const Card = ({ item, index, getTotalPrice }) => {

    let dispatch = useDispatch();
    let { cart: Cart } = useSelector(s => s.cart)
    let [loading, setLoading] = useState(false);




    async function RmFromCart(cartId) {
        setLoading(true)
        try {
            const {
                data, 
                status
            } = await baseApi.delete("/cart/delete", {
                data: {
                    id: cartId
                }
            })

            if(!data.success){
                setLoading(false);
                throw new Error("Error: ", data.message)
            }
            if(data.success){
                dispatch(
                    set_cart(
                        Cart.filter(c =>
                            c?.id != cartId
                        )
                    )
                );
                setLoading(false);

            }


        } catch (error) {
            console.log(error)
        }
    }



    async function updateHandler(type, qty, id) {
        setLoading(true);
        let cartQty = type === "add" ? qty + 1 : qty - 1;
        const {
            data,
            status
        } = await baseApi.patch("/cart/edit", { id, qty: cartQty });

        if (!data.success) {
            throw new Error("Error: ", data.message);
            setLoading(false)
        }
        if (data.success) {
            dispatch(
                set_cart(
                    Cart.map(c =>
                        c?.id == id
                        ? { ...c, quantity: cartQty }
                        : c
                    )
                )
            );
            setLoading(false)
        }
    }

    useEffect(() => {
        getTotalPrice();
    }, [Cart])

    return (
        <>
            <div key={index} className="buyer-cart-card shadow-sm" style={{ height: "190px" }}>
                <div className='thumbnail-cnt'>
                    <Thumbnail thumbnail_id={item?.thumbnail_url} height={'100%'} />
                </div>

                <div className="buyer-cart-body" style={{ justifyContent: "space-between" }}>


                    <div className='buyer-item-title' style={{ fontWeight: '500', fontSize: 'medium' }}>
                        <p>{item.name}</p>
                    </div>

                    <div className="buyer-item-price">
                        <span style={{ fontWeight: 'bold' }}>&#8358;{new Intl.NumberFormat('en-us').format(item.price)} </span>
                    </div>

                    <div className="buyer-item-units">
                        <span>{item.stock} units Available</span>
                    </div>

                    <div className="buyer-items-stock" data-price={item.price}>
                        <button onClick={(e) => updateHandler('reduce', Number(item.quantity), item.id)} data-id={item.product_id} disabled={loading || item.quantity < 2}>-</button>

                        <div id={`ce${item.product_id}`}>
                            {item.quantity}
                        </div>

                        <button onClick={(e) => updateHandler('add', Number(item.quantity), item.id)} disabled={loading || Number(item.quantity) === Number(item.stock)}>+</button>
                    </div>

                </div>
                <button className="buyer-cart-remove-btn" style={{ background: '#efefef', position: "absolute", top: "15px", right: "15px", left: "unset", width: "fit-content" }} onClick={e => RmFromCart(item.id)} disabled={loading}>
                    <IoTrashBinOutline color="#000" />
                </button>
            </div>
        </>
    );
}

export default Card;