import { useEffect, useState } from "react";
// import '@/files/styles'
// import '@/styles/Seller/overlay.css' 

import { useNavigate } from "react-router-dom";
import Thumbnail from "../Thumbnail";
import { useDispatch, useSelector } from "react-redux";

const CardCnt = ({items}) => {

    let [screenWidth, setScreenWidth] = useState(0)

    let navigate = useNavigate()

    useEffect(() => {
        let width = window.innerWidth;
        setScreenWidth(width)
    }, [])

    
    
 
    let dispatch = useDispatch()

    return ( 
        <>
            <div className="overlay" >
                <div className="loader">
                </div>
            </div>
            <div className="buyer-card-cnt" style={{width: '100%', display: 'flex', alignItems: 'center', background: '#fff', height: 'fit-content', minHeight: 'unset'}}>
                {/* <div className="buyer-sort shadow-sm">
                    <div className="left">
                        Latest Items For Sale
                    </div>
                    <div onClick={openFloatingMenu} className="right">
                        Sort by: {selectedOption}
                    </div>
                </div> */}

                { 
                    items.length > 0
                    ?
                    items.map((item, index) => 
                    <div className="cols" >
                            <div className="card" key={index} style={{height: 'fit-content', marginBottom: '10x', flexShrink: '0', width: '200px', borderRadius: '10px'}}>
                                {/* <span  style={{background: 'orangered',display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute',color: '#000', borderRadius: '5px', top: screenWidth > 400 ? '15px' : '8px', left: screenWidth > 400 ? '15px' : '8px', padding: '2.5px'}}>
                                    <span  style={{background: 'orangered',color: 'orangered', padding: '0'}}>
                                        <img src={locationSvg} style={{height: screenWidth  > 480 ? '15px' : '8px', width: screenWidth  > 480 ? '20px' : '10px', marginBottom: '5px'}} alt="" />

                                    </span>

                                    <span  style={{background: 'orangered',color: '#fff', padding: '0',  fontSize: screenWidth > 480 ? 'x-small' : 'xx-small', fontWeight: '500'}}>
                                        UNIZIK, Awka
                                    </span>
                                </span> */}
                                <Thumbnail product_id={item.product_id} />

                                <div className="card-body">
                                    
                                    {
                                        screenWidth > 479
                                        ?
                                        <small style={{fontSize: 'small', fontFamily: 'sans-serif', height: '35px', lineHeight: '18px', color: '#000'}} onClick={e => navigate(`/product?product_id=${item.product_id}`)} >{item.title}</small>
                                        : 
                                        <small style={{fontSize: 'small', fontFamily: 'sans-serif', height: '35px', lineHeight: '18px', color: '#000'}} onClick={e => navigate(`/product?product_id=${item.product_id}`)} >{item.title}</small>
                                    }

                                    {/* <br /> */}

                                    {/* <hr  /> */}
                                    
                                    {
                                        screenWidth > 479
                                        ?
                                        <h6 onClick={e => navigate(`/product?product_id=${item.product_id}`)} style={{marginBottom: '10px', marginTop: '10px', fontWeight: '500', color: '#000'}}>&#8358;{
                                            new Intl.NumberFormat('en-us').format(item.price)
                                        }</h6>
                                        : 
                                        <h6 onClick={e => navigate(`/product?product_id=${item.product_id}`)} style={{marginBottom: '10px', fontWeight: '700', color: '#000'}}>&#8358;{new Intl.NumberFormat('en-us').format(item.price)}</h6>
                                    }

                                    {/* <div onClick={e => navigate(`/product?product_id=${item.product_id}`)} style={{display: 'flex',background: '#fff', color: 'orangered',  alignItems: 'center', justifyContent: 'left', padding: '0'}}>
                                        <span  style={{background: '#fff', color: '#000', borderRadius: '5px', top: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', left: '20px', padding: '5px 0 5px 0'}}>
                                            <span  style={{background: '#fff',color: 'orangered', padding: '0'}}>

                                                <img src={conditionSvg} style={{height: '20px', width: '20px', marginBottom: '5px'}} alt="" />

                                            </span>
                                            &nbsp;

                                            <span  style={{background: '#fff',color: 'rgb(98, 98, 98)', padding: '0',  fontSize: 'x-small', fontWeight: '500'}}> 
                                                {JSON.parse(item.others)?.condition}
                                            </span>
                                        </span>
                                        
                                    </div>

                                    <button onClick={e => Saver(e,item.product_id)} style={{position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', right: '0px', top: '55px', background: '#fff', color: '#626262', height: '50px', width: 'fit-content'}}>
                                        <img src={saveSvg} style={{height: '25px', width: '25px', position: 'relative',  margin: 'auto'}} alt="" />
                                        <section style={{marginTop: '-5px', fontSize: 'x-small'}}>
                                            {[...Save].filter(savedItem => savedItem.product_id === item.product_id)[0] ? 'Unsave' : 'Save'}
                                        </section>
                                    </button> */}

                                    

                                    {/*<div style={{position: 'absolute', right: '5px', bottom: '5px', fontSize: 'small', background: '#fff', color: '#626262'}}>
                                        <span>
                                            <img src={orderSvg} style={{height: '20px', width: '20px', marginBottom: '3px'}} alt="" />

                                        </span>
                                        &nbsp;
                                        <span>
                                            20 Orders
                                        </span>
                </div>*/}
                                </div>

                                {/* <button style={BtnStyles} onClick={e => {
                                    let response = isBuyerLoggedIn('dashboard');
                                    if(!response.success){set_elem(response.elem)} else{set_elem(AddToCart(e,item.product_id))}
                                }}>

                                

                                    <span>
                                        <img src={cartSvg} style={{height: '25px', width: '25px', position: 'relative', borderRadius: '2.5px',marginRight: '5px'}} alt="" />
                                    </span>
                                    <span style={{fontSize: 'x-small'}}>{[...Cart].filter(cart => cart.product_id === item.product_id)[0] ? 'Remove From Cart' : 'Add To Cart'}</span>
                                </button> */}
                                {/*<br />*/} 

                                {/* <div className="card-footer">
                                    <img src={img} style={{height: '30px', width: '30px', borderRadius: '10px'}} alt="" />

                                    <div style={{height: 'fit-content', width: 'fit-content', position: 'absolute', left: '40px', bottom: '5px', fontWeight: '800', fontSize: 'small'}} >Jacob.N.N</div>

                                    <div style={{position: 'absolute', right: '5px', bottom: '5px', color: '#626262', fontSize: 'small', fontWeight: '500'}}>
                                        <span>
                                            <img src={timeSvg} style={{height: '20px', width: '20px', marginBottom: '3px'}} alt="" />

                                        </span>
                                        &nbsp;
                                        <span>
                                            2 days ago
                                        </span>
                                    </div>
                                </div> */}

                            </div>
                        </div> 
                    )
                    :
                    ''
                }
                
            </div>
        </>
     );
}
 
export default CardCnt;