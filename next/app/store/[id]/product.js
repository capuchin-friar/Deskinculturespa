"use client"
import Head from 'next/head';
import '@/app/store/[id]/styles/xx-large.css'
import '@/app/store/[id]/styles/x-large.css'
import '@/app/store/[id]/styles/large.css'
import '@/app/store/[id]/styles/semi-medium.css'
import '@/app/store/[id]/styles/medium.css'
import '@/app/store/[id]/styles/g.css'
import Product from "@/src/components/customer/Product/Product";
import { useEffect, useRef, useState } from "react";
import Description from "@/src/components/customer/Product/Description";
// import { AddView } from "../../api/buyer/post";
import { useSelector } from "react-redux";
// import cartSvg from '@/files/assets/add-to-the-cart-svgrepo-com.svg'  
// import ytCartSvg from '@/files/assets/add-to-cart-yt.svg'
// import imgSvg from '@/files/assets/image-svgrepo-com (4).svg'; 
  
import Aside from "@/src/components/customer/Product/Aside";
import { usePathname } from "next/navigation";
// import { GetSeller } from "@/app/storeapi/seller/get";
// import Reviews from '@/src/components/customer/Product/Reviews';
// import Carousel from '@/src/components/customer/dashboard/Carousel';
import axios from 'axios';
// import { open_notice } from '@/src/reusable.js/notice';
// import { buyer_overlay_setup } from '@/src/reusable.js/overlay-setup';
// import Share from '@/src/components/customer/Product/Share';
import { useParams } from 'next/navigation';
// import Contact from '@/src/components/customer/Product/Contact'; 

const ProductPageClient = ({product}) => {
    let pathname = usePathname()
    let user_id = {};
    let ItemImages = [];
    let ActiveImg = {};
    // let {
    //     user_id
    // }=useSelector(s=>s.user_id);

    // let {ItemImages} = useSelector(s => s.itemImages);
    // let {ActiveImg} = useSelector(s => s.ActiveImg);

    let [seller, set_seller] = useState(1);
    let [screenWidth, setScreenWidth] = useState(0);

    let [activeImg, setActiveImg] = useState("");
    let [item, setItem] = useState();
    let [order_list, set_order_list] = useState([]);
    const params = useParams();
    //const searchParams = new URLSearchParams(window.location.search);
    
    let [searchParams, set_searchParams]=useState('');
    useEffect(() => {
    
        const product = pathname.split('/').splice(-1)[0];
        set_searchParams(product);
        //set_searchParams(new URLSearchParams(window.location.search).get('product'))
    }, []);
    
    
    useEffect(() => {let width = window.innerWidth;setScreenWidth(width)}, []);
    // useEffect(() => {setActiveImg(ItemImages?.length > 0 ? ItemImages[ActiveImg] : imgSvg)}, [ItemImages]);
    // useEffect(() => {setActiveImg(ItemImages?.length > 0 ? ItemImages[ActiveImg] : imgSvg)}, [ActiveImg]);
    useEffect(() => {setActiveImg('')}, [searchParams]);

    useEffect(() => {
        // buyer_overlay_setup(true, 'Getting Product Info...')
        try {
            if (product) {
                setItem(product)
                // buyer_overlay_setup(false, '')
            }else{
                // open_notice(true, error.message)
                // buyer_overlay_setup(false, '')

                console.log(error)
            }
        } catch (error) {
            // buyer_overlay_setup(false, '')

            console.log(error)
        }
    }, [pathname])


    useEffect(() => {
        try {
            let overlay = document.querySelector('.overlay');
            overlay.setAttribute('id', 'overlay');
            if (product.user_id) {
                fetch(`https://cs-node.vercel.app/vendor?user_id=${product?.user_id}`, { cache: 'no-store',}).then(async (res) => {
                    let response = await res.json()
                    set_seller(response.data)
                    console.log('seller: ', response)

                    overlay.removeAttribute('id')

               }).catch(err => console.log(err))
            }
        } catch (error) {
            console.log(error)
            // window.location.reload()

        }
    },[product])

    async function AddNewViewer(product_id,user_id) {
        fetch(`/api/store/new-view`, {
            method: 'post',
            headers: {
                'Gender': window.localStorage.getItem('cs-gender') 
            },
            body: JSON.stringify({
                product_id,
                user_id
            })
        })
        .then(async(res) => {
            let response = await res.json();

            if (response.success) {
                
                
            } else {
                
            }
        })
        .catch(err =>{
            console.log(err)
        });
    }
 
    const hasRun = useRef(false);

    useEffect(() => {
        if (!item?.product_id || hasRun.current) return;
        hasRun.current = true;

        const user_id =
        window.localStorage.getItem("CE_user_id") ||
        window.localStorage.getItem("id_for_unknown_buyer");

        const finalBuyerId = user_id && user_id !== 'null' ? user_id : window.localStorage.getItem("id_for_unknown_buyer");

        try {
            setTimeout(() => {
                AddNewViewer(item?.product_id, finalBuyerId);
            }, 3000);
        } catch (error) {
            console.log(error);
        }
    }, [product?.product_id]);
    
    async function handleOrder() {
        let result = order_list.filter((data) => data.product.product_id === product.product_id && data.order.user_id === user_id).length
        if(result<1){
            if(user_id === null || user_id === '' || user_id === 'null'){
                window.location.href=(`/login`)
            }else{
                window.location.href=(`/store/orders/${product.product_id}/create`)
            }
        }else{
            window.location.href=(`/store/orders/${product.product_id}/checkout`)
        }
    }

    function SaveHistory() {
        const history = JSON.parse(localStorage.getItem('campus_express_history') || '[]');
        const isDuplicate = history.some(data => data?.product_id === product?.product_id);
        if (!isDuplicate) {
            const updatedHistory = [...history, { category: product?.category, product_id: product?.product_id }];
            localStorage.setItem('campus_express_history', JSON.stringify(updatedHistory));
        }
    }

    useEffect(() => {
        
        if (user_id) {
            fetch(`/api/store/orders?user_id=${user_id}`, { cache: 'no-store', }).then(async (res) => {
                let response = await res.json();
               
               if (response?.success) {
                    set_order_list(response?.data)
               }
           }).catch(err => console.log(err))
        }
      
    }, [user_id]) 
    

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product?.name,
        image: product?.thumbnail_id,
        description: product?.description,
    }
    const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product?.title,
    "image": [product?.thumbnail_id],
    "description": product?.description,
    "sku": product?.product_id,
    "brand": {
      "@type": "Brand",
      "name": "Campus Sphere"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.campussphere.net/store/product/${product?.product_id}`,
      "priceCurrency": "NGN",
      "price": product?.price,
   
    }
  };

    let { cart: Cart } = useSelector(s => s.cart);
    const [is_carted, set_is_carted] = useState(false);
    useEffect(() => {
        let filter = Cart.filter(cart_item => cart_item.product_id === item.product_id)
        set_is_carted(filter.length > 0)
    }, [Cart])


    function cartHandler () {
        buyer_overlay_setup(true, 'Processing')
        if (!is_carted) {
            axios.post('/api/store/cart/create', {
                product_id: item.product_id,
                user_id: buyer_info.user_id
            }).then((response) => {
                buyer_overlay_setup(false, '...')

                if(response.data.success){
                    dispatch(setCartTo([...Cart, response.data.cart_item]))
                    open_notice(true, "Item was  added to cart successfully")
                }else{
                    open_notice(true, "Item was not added to cart due to error")
                }
            }).catch(err => {
                console.log(err);
                buyer_overlay_setup(false, '...')
                open_notice(true, "Item was not added to cart due to error")
            })
        }else{
            let id = Cart.filter(d => d.product_id === item.product_id)[0].cart_id
            axios.post('/api/store/cart/delete', {
                cart_id: id
            }).then((response) => {
                buyer_overlay_setup(false, '...')

                if(response.data.success){
                    dispatch(setCartTo(Cart.filter(d => d.cart_id !== id)))
                    open_notice(true, "Item was  deleted from cart successfully")
                }else{
                    open_notice(true, "Item was not deleted from cart due to error")
                }
            }).catch(err => {
                console.log(err);
                buyer_overlay_setup(false, '...')
                open_notice(true, "Item was not deleted from cart due to error")
            })
        }
    }
    
   
    return ( 
        <>
            <Head>
                <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className='buyer-product'>
                <div className="buyer-product-cnt" style={{position: 'relative'}}>

                    
                    <Product order_list={order_list} item={product} seller={seller} />

                    {
                        screenWidth > 481
                        ?
                        ''
                        :
                        <>
                            {/* <Contact phone={seller?.phone} item={product}  /> */}
                            <br /> 
                            <button style={{
                                position: 'absolute',
                                bottom: '145px',
                                right: '10px',
                                width: 'fit-content',
                                height: 'fit-content',
                                borderRadius: '6px',
                                background: is_carted ? '#FF4500' : 'transparent',
                                border: '1px solid #FF4500'
                            }} onClick={e => {
                                cartHandler()
                            }}
                                disabled={
                                    order_list?.filter((data) => data?.product?.product_id === item?.product_id && data?.order?.user_id === user_id).length > 0
                                }
                            >
                                {/* {
                                    is_carted
                                    ?
                                    <img src={ytCartSvg.src} style={{height: '22px', width: '22px'}} alt="" />
                                    :
                                    <img src={cartSvg.src} style={{height: '22px', width: '22px'}} alt="" />
                                    
                                } */}
                            </button>
                            <button style={{borderRadius: '2.5px',border: 'none', outline: 'none', width: '100%'}} className='shadow' onClick={e=>handleOrder(item.product_id)}> 
                                {
                                    order_list?.filter((data) => data?.product?.product_id === item?.product_id && data?.order?.user_id === user_id).length > 0
                                    ?

                                    'Track Order'
                                    :
                                    'Pay Now'
                                }
                             
                            </button>
                        </>
                    }

                    {
                        screenWidth <= 620
                        ?
                        <div className="buyer-product-aside">
                            <Aside seller={seller} item={product} order_list={order_list} />
                        </div>
                        :
                        ''
                    }
                    

                    {
                        product?.description
                        ?
                        <Description item={product} />
                        :
                        ''
                    }


                    {/* <Reviews /> */}
                    <section style={{marginBottom: '0', marginTop: "10px"}}> 
                        <div className="header" style={{height: '50px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'left', position: 'relative', width: '100%', background: '#fff'}}>
                            <div style={{float: 'left', color: '#000', fontFamily: 'sans-serif',}}><b>Similar Items You May like</b></div>
                        </div>
                        <div style={{display: 'flex'}}>
                            {/* {
                                product
                                ?
                                <Carousel category={btoa(product?.category)} product_id={product?.product_id} />
                                :
                                ''
                            } */}
                        </div>
                    </section>

                    

                </div>

                {
                    screenWidth > 620
                    ?
                    <div className="buyer-product-aside">
                        <Aside seller={seller} item={product} order_list={order_list} />
                    </div>
                    :
                    ''
                }
            </div>
        </>
     );
}
 
export default ProductPageClient;



// export default function Page({ params, searchParams }) {}