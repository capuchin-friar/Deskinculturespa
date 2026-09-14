import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import imgSvg from '../../../assets/image-svgrepo-com (4).svg'; 
// import { setItemImagesTo } from "@/redux/buyer_store/ItemImages";
import axios from "axios";

const ItemImgs = ({imgList, activeImg, handleActiveImage}) => {

    useEffect(() => {
        console.log("activeImg: ", activeImg)
        console.log("imgList: ", imgList)
    }, [activeImg]);
    return ( 
        <>
            <div className="img-list-cnt">
                {
                    imgList.map((item, index) => {
                        return(
                            <div key={index} style={{border: activeImg === index ? '1px solid orangered': 'none', cursor: 'pointer', height: '50px', width: '50px', backgroundImage: `url(${item})`, backgroundRepeat: 'no-repeat', backgroundSize: '50px 50px', backgroundPosition: 'center', borderRadius: '5px'}} onClick={e => handleActiveImage(index)}>
                                {
                                    (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(item.secure_url?.split('.').pop().toLowerCase())) ? 
                                    <img src={item.secure_url} style={{height: '100%', width: '100%', borderRadius: '5px'}} alt="" loading="lazy" />
                                    :
                                    <video src={item.secure_url} style={{width: '100%', height: '100%', borderRadius: '2px'}} alt="" loading="lazy"></video>

                                }
                            </div>
                        )
                    })
                }
                
            </div>
        </>
     );
}
 
export default ItemImgs;