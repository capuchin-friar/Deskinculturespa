import React from 'react'
import { IoLogoFacebook, IoLogoTwitter, IoLogoWhatsapp } from "react-icons/io5";
export default function Share({role,item,url,activeImg}) {
  return (
    <>
      <section style={{fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '10px', position: 'relative', width: '100%',}}>
            <small style={{fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"}}>Share With Your Friends</small>

            <ul>
                <li onClick={e => {
                    // const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=Check out this product on Campus Sphere ${encodeURIComponent(window.location.href)}`, '_blank');
                }} style={{border: 'none', padding: '0',cursor: 'pointer'}}>
                    <IoLogoFacebook size={25} />
                </li>

                <li onClick={e => {
                    // const url = window.location.href;
                    const twitterUrl = `https://twitter.com/intent/tweet?&text=Check out this product on Campus Sphere ${encodeURIComponent(window.location.href)}`;
                    window.open(twitterUrl, '_blank');
                }} style={{border: 'none', padding: '0',cursor: 'pointer'}}>
                    <IoLogoTwitter size={25} />
                </li>

                <li onClick={async e => {
                    const whatsappUrl = `whatsapp://send?text=Check out this product on Campus Sphere ${encodeURIComponent(window.location.href)}`;
                    window.open(whatsappUrl, '_blank');

                }} style={{border: 'none', padding: '0', cursor: 'pointer'}}>
                    <IoLogoWhatsapp size={25} />
                </li>

            </ul>

            
        </section>
    </>
  )
}
