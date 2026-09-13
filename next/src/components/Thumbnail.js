import { useEffect, useState } from 'react';
// import imgSvg from '../../assets/image-svgrepo-com (4).svg'; 

const Thumbnail = ({thumbnail_id,height}) => {
    let [screenWidth, setScreenWidth] = useState(0);
    useEffect(() => {
        setScreenWidth(window.innerWidth)
    }, [])

    
    return ( 
        <>
            <img loading='lazy' onClick={e => window.location.href=(`/product/${product_id}`)} src={thumbnail_id} style={{height: `${height ? height : '150px'}`, width: '100%', borderRadius: '2px', display: 'table', margin: '0 auto', position: 'relative'}} alt="" />
        </>
     );
}
 
export default Thumbnail;