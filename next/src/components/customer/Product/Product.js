// import cartSvg from '../../../assets/add-to-the-cart-svgrepo-com.svg'
// import ytcartSvg from '../../../assets/add-to-cart-yt.svg'
import {
    useEffect,
    useState
} from 'react'

import {
    useDispatch,
    useSelector
} from 'react-redux'
import ItemImgs from './ItemImgs'
import Share from './Share'
// import SaveButton from '../dashboard/SaveButton'
// import { UnSaveItem } from '@/app/api/buyer/delete'
// import { setSaveTo } from '@/redux/buyer_store/Save'
// import { SaveItem } from '@/app/api/buyer/post'
import Contact from './Contact'
import Link from 'next/link'
import axios from 'axios'
import { IoCart, IoCartOutline, IoCubeOutline, IoImageOutline } from 'react-icons/io5'
import StarRating from '../../../utils/star'
import { baseApi } from '../../../../app/api/config'
import { set_cart } from '../../../../redux/customer/cart'
import QuantityCounter from '../QuantityCounter'
import { data } from 'react-router-dom'
import useToggler from "../../../hooks/toggler"
let BtnStyles = {
    height: '35px',
    width: '100%',
    borderRadius: '5px',
    outline: 'none',
    // padding: '0',
    border: 'none',
    float: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 'small',
    fontWeight: '500',
    backgroundColor: '#278A3D',
    margin: '0'
}

const Product = ({ item }) => {
    let dispatch = useDispatch()

    let { cart } = useSelector(s => s.cart);


    let user_id = {};
    let ItemImages = [];
    let ActiveImg = {};

    const {
        addToCart,
        rmFromCart,
        isCarted
    } = useToggler();

    // let {
    //     user_id
    // } = useSelector(s => s.user_id);
    // let { 
    //     savedItem
    // } = useSelector(s => s.savedItem)
    // let {
    //     buyer_info
    // } = useSelector(s => s.buyer_info);
    let [saved, setSaved] = useState(false)
    let [btnMode, setBtnMode] = useState(true)
    let [searchParams, setsearchParams] = useState({})
    // let {ItemImages} = useSelector(s => s.itemImages)
    // let {ActiveImg} = useSelector(s => s.ActiveImg)

    let [metaImg, setMetaImg] = useState('')
    let [screenWidth, setScreenWidth] = useState(0)
    let [loading, setLoading] = useState(false);
    let [qty, setQty] = useState(1);



    // useEffect(() => { setMetaImg(ItemImages[0]) }, [])
    // useEffect(() => {setActiveImg(ItemImages?.length > 0 ? ItemImages[ActiveImg].secure_url : imgSvg)}, [ItemImages])
    // useEffect(() => {setActiveImg(ItemImages?.length > 0 ? ItemImages[ActiveImg].secure_url : imgSvg)},[])
    // useEffect(() => {setActiveImg(ItemImages?.length > 0 ? ItemImages[ActiveImg].secure_url : imgSvg)},[ActiveImg])

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams?.get('id')) {
            setActiveImg('')
        }
    }, [searchParams])
    useEffect(() => { let width = window.innerWidth; setScreenWidth(width) }, [])


    const handleRatingChange = (newRating) => setRating(newRating);
    const buyNow = () => "";

    useEffect(() => {
        let cartedProd = cart.find(c => c.product_id === item.id);
        if (cartedProd) {
            setQty(cartedProd.quantity);
        }
    }, [cart]);



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
                    cart.map(c =>
                        c?.id == id
                            ? { ...c, quantity: cartQty }
                            : c
                    )
                )
            );
            setLoading(false)
        }
    }


    async function toggleCart() {
        let isProductCarted = isCarted(item.id);

        if (isProductCarted) {
            await rmFromCart(item.id);
            setQty(1);
        } else {
            await addToCart({item, qty})
        }

    }

    let [activeImg, setActiveImg] = useState(0);

    function handleActiveImage(data) {
        setActiveImg(data)
    }

    return (
        <>

            <div className="overlay">
                <div className="loader">
                </div>
            </div>

            <div className="buyer-product-data">
                <div id="left">
                    {

                        <div className="img-cnt" style={{ backgroundImage: `url(${item.images[activeImg]})`, borderRadius: '5px', backgroundRepeat: 'no-repeat', backgroundSize: '350px 350px', backgroundPosition: 'center' }}>
                            <img src={item.images[activeImg]} style={{ height: '100%', width: '100%', borderRadius: '5px' }} alt="" loading="lazy" />
                        </div>
                    }
                    {
                        item
                            ?
                            <ItemImgs
                                imgList={item?.images}
                                activeImg={activeImg}
                                handleActiveImage={handleActiveImage}
                            />
                            :
                            ''
                    }
                </div>

                <div id="right" style={{ position: 'relative' }}>

                    <div style={{ borderBottom: '1px solid #696969' }}>
                        <div style={{ fontSize: '3vh', marginBottom: '10px' }}>{item?.title}</div>
                        <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                            Category: <span style={{ color: 'blue' }}>{item?.category}</span> | <span style={{ color: 'blue' }}>Similar products from {item?.category}</span>
                        </div>
                    </div>

                    {

                        <div style={{ background: '#fff', padding: '10px', color: '#278A3D', fontWeight: '500', position: 'relative', borderRadius: '5px', height: 'fit-content' }}>

                            <p style={{ fontWeight: '700', margin: '0', padding: '10px 0', fontSize: '3.5vh', color: '#000' }}>
                                <small>&#8358;</small>{new Intl.NumberFormat('en-us').format(item?.price)}
                            </p>


                            <h3 style={{ fontSize: 'small', fontWeight: 'bold', textDecoration: 'underline', padding: '0px', textTransform: 'capitalize', color: '#278A3D', marginBottom: '10px', display: "flex", alignItems: 'center', justifyContent: 'flex-start' }}>
                                <IoCubeOutline size={25} /> &nbsp; {item?.stock} units availble
                            </h3>
                            <br />

                            <div className="buyer-items-stock" data-price={item.price} style={{
                                opacity: cart.some(c => c.product_id === item.id) ? 1 : .5,
                                pointerEvents: cart.some(c => c.product_id === item.id)
                            }}>
                                <button onClick={(e) => updateHandler('reduce', Number(qty), cart.find(c => c.product_id === item.id).id)} data-id={item.product_id} disabled={loading || qty < 2 || !cart.some(c => c.product_id === item.id)}>-</button>

                                <div id={`ce${item.product_id}`}>
                                    {qty}
                                </div>

                                <button onClick={(e) => updateHandler('add', Number(qty), cart.find(c => c.product_id === item.id).id)} disabled={loading || Number(qty) === Number(item.stock) || !cart.some(c => c.product_id === item.id)}>+</button>
                            </div>
                        </div>

                    }


                    {/* <SaveButton data={item} Saver={Saver} isItemSaved={saved} /> */}

                    <br />



                    {
                        screenWidth > 481
                            ?
                            <>
                                {/* <Contact phone={item.phone} item={item} /> */}

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "0px 10px",

                                }}>
                                    {/* <button style={{ borderRadius: '2.5px', border: 'none', outline: 'none', width: '46%' }} className='shadow' onClick={e => handleOrder(item.product_id)}>
                                        Buy Now
                                    </button> */}
                                    <button style={{ borderRadius: '2.5px', border: 'none', outline: 'none', width: '100%' }} className='shadow' onClick={e => toggleCart()}>
                                        {
                                            isCarted(item.id) ? "Remove From Cart" : "Add To Cart"
                                        }
                                    </button>
                                </div>

                                <br />




                            </>
                            :
                            ''

                    }



                    <Share activeImg={activeImg} item={item} url={`https://www.deskinculture.com/store/${item?.id}`} metaImg={metaImg} />

                </div>
            </div>

        </>
    );
}

export default Product;