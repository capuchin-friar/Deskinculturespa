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
import Carousel from '../../../src/components/customer/Product/SimilarProds';
import SimilarProducts from '../../../src/components/customer/Product/SimilarProds';
import useToggler from '../../../src/hooks/toggler';
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
        try {
            if (product) {
                setItem(product)
            }else{
                console.log(error)
            }
        } catch (error) {
            console.log(error)
        }
    }, [pathname])

    const hasRun = useRef(false);
    const {
        addToCart,
        rmFromCart,
        isCarted
      } = useToggler();
    

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

    function cartHandler () {
        buyer_overlay_setup(true, 'Processing')
        if (!isCarted(item?.id ?? item?.product_id)) {
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
                                background: isCarted(item?.id ?? item?.product_id) ? '#278A3D' : 'transparent',
                                border: '1px solid #278A3D'
                            }} onClick={e => {
                                cartHandler()
                            }}
                                disabled={
                                    order_list?.filter((data) => data?.product?.product_id === item?.product_id && data?.order?.user_id === user_id).length > 0
                                }
                            >
                            </button>
                            <button style={{borderRadius: '2.5px',border: 'none', outline: 'none', width: '100%'}} className='shadow' onClick={e=>
                                // handleOrder(item.product_id)
                                ""
                                }> 
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
                        {/* <div className="header" style={{height: '50px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'left', position: 'relative', width: '100%', background: '#fff'}}>
                            <div style={{float: 'left', color: '#000', fontFamily: 'sans-serif',}}><b>Similar Items You May like</b></div>
                        </div> */}
                            <SimilarProducts /> 
                        <div style={{display: 'flex'}}>
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