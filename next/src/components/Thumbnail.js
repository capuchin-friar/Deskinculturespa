import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import imgSvg from '../../assets/image-svgrepo-com (4).svg'; 

const Thumbnail = ({product_id, thumbnail_id, height}) => {
    let [screenWidth, setScreenWidth] = useState(0);
    const router = useRouter();
    useEffect(() => {
        setScreenWidth(window.innerWidth)
    }, [])

    
    return ( 
        <>
            <img loading='lazy' onClick={() => router.push(`/store/${product_id}`)} src={thumbnail_id} style={{height: `${height ? height : '150px'}`, width: '100%', borderRadius: '2px', display: 'table', margin: '0 auto', position: 'relative'}} alt="" />
        </>
     );
}
 
export default Thumbnail;
