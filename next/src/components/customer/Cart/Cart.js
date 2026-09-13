// import img from '../../../assets/download (3).jpeg'
// import deleteSvg from '../../../assets/delete-svgrepo-com (1).svg'
import {
    useEffect, useState
} from 'react'
import jsAgo from 'js-ago'
// import imgSvg from '../../../assets/image-svgrepo-com (4).svg'; 
import {
    useDispatch, useSelector
} from 'react-redux';
// import { 
//     setCartTo 
// } from '../../../redux/buyer_store/Cart';
// import { 
//     useNavigate 
// } from 'react-router-dom';
import Card from './CartCard';
import Btn from './Btn';
import axios from 'axios';
// import { GetCartItems } from '@/app/api/buyer/get';


const CartComp = () => {
    let [Items, setItems] = useState([])
    let [url, setUrl] = useState('')
    let [subTotal, setSubTotal] = useState('0.00');

    let { cart: Cart } = useSelector(s => s.cart)


    function getTotalPrice() {
        let list = [...document.querySelectorAll(".buyer-items-stock")];
        let values = []
        list.map((item) => values.push(parseInt(item.children[1].innerHTML ?? 0) * parseInt(item.dataset.price)))
        let total = sum(values, values.length)
        setSubTotal(total)
    }
    function sum(arr, n) {
        // base or terminating condition
        if (n <= 0) {
            return 0;
        }

        // Calling method recursively
        return sum(arr, n - 1) + arr[n - 1];
    }

    useEffect(() => {
        if (Cart) {
            setItems(Cart);
            let prices = []

            Cart.map((item) => prices.push(parseInt((Number(item.price) * Number(item.quantity)) + (item?.shipping_fee ?? 0))))
            let s = sum(prices, prices.length);
            setSubTotal(s)
        }
    }, [Cart])

  
    let [screenWidth, setScreenWidth] = useState(0)

    useEffect(() => {
        let width = window.innerWidth;
        setScreenWidth(width)
    }, [])

  

    return (
        <>
            <div className="buyer-cart">
                {
                    Items?.map((item, index) => {
                        return (
                            <Card product_id={item.product_id} getTotalPrice={getTotalPrice} item={item} index={index} />
                        )
                    })
                }
            </div>

            {
                screenWidth > 659

                    ?

                    <div className="buyer-cart-checkout">
                        <div style={{ borderBottom: '1px solid #eeeeee' }}>
                            <span>Cart Summary</span>
                        </div>

                        <div>
                            <small style={{ float: 'left' }}>Sub total</small>
                            <small style={{ float: 'right' }}><small>&#8358;</small>{new Intl.NumberFormat('en-us').format(subTotal)}</small>
                        </div>

                        <div style={{ fontSize: 'small' }}>
                            <small>Delivery is free</small>
                        </div>
                        <div style={{ height: '80px' }}>
                            <Btn url={url} subTotal={subTotal} />
                        </div>
                    </div>
                    :
                    <>
                        <div style={{ position: 'fixed', bottom: '0', padding: '20px', left: '0', width: '100%' }}>
                            <Btn url={url} subTotal={subTotal} />
                        </div>
                    </>


            }
        </>
    );
}



export { CartComp as Cart };