import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import imgSvg from '../../../assets/image-svgrepo-com (4).svg'; 
// import { setItemImagesTo } from "@/redux/buyer_store/ItemImages";
// import { setActiveImgTo } from "@/redux/buyer_store/ActiveImg";
import axios from "axios";

const ItemImgs = ({product_id,title,category}) => {
    let dispatch = useDispatch()
    let [img, set_img] = useState("");
    let [uris, set_uris] = useState([]);

    let ItemImages = [];
    let ActiveImg = {};
    // let {ItemImages} = useSelector(s => s.itemImages)
    // let {ActiveImg} = useSelector(s => s.ActiveImg)

  
    useEffect(() => {
        set_img(uris[0]?.secure_url)
    },[uris])
   

   

    useEffect(() => {
        try {
            axios.get('/api/store/image-folder', {params: {folder: product_id}})
            .then(({data})=>{
                set_uris(data.data)
                dispatch(setItemImagesTo(data.data))
            })
            .catch(error=>{
                console.log(error)
            })
        } catch (error) {
            console.log(error)
        }
    }, [product_id])

    let handleActiveImg = i => {
        dispatch(setActiveImgTo(i))
    }

    return ( 
        <>
            <div className="img-list-cnt">
                {
                    uris.map((item, index) => {
                        return(
                            <div key={index} style={{border: ActiveImg === index ? '1px solid orangered': 'none', cursor: 'pointer', height: '50px', width: '50px', backgroundImage: `url(${item.file})`, backgroundRepeat: 'no-repeat', backgroundSize: '50px 50px', backgroundPosition: 'center', borderRadius: '5px'}} onClick={e => handleActiveImg(index)}>
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