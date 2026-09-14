import React from 'react'
// import phn from '../../../assets/phone-rounded-svgrepo-com.svg'
// import mssg from '../../../assets/whatsapp-whats-app-svgrepo-com.svg'
export default function Contact({phone,item}) {
  return (
    <>
      <div style={{
            height: '120px',
            width: '100%',
            // borderRadius: '10px',
            outline: 'none',
            border: 'none',
            textAlign: 'center',
            color: '#fff',
            padding: '10px 20px',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            fontSize: 'medium',
            fontWeight: '500',
            backgroundColor: '#fff',
            marginTop: '20px'
        }}>
        {/* onClick={e => true !== 0 ? DeleteProduct(e,item.product_id) : AddToCart(e,item.product_id)} */}
            <button className='shadow-sm' style={{height: '50px', width: '45%', borderRadius: '5px', display: 'flex', alignItems: 'center', cursor: 'pointer',fontSize: 'x-small', justifyContent: 'center', background: '#278A3D', color: '#fff'}}  onClick={async e => {
                const whatsappUrl = `whatsapp://send?text=Hey, I would love to make more enquiries about "${item.title}" ${encodeURIComponent(window.location.href)}`;
                window.open(whatsappUrl, '_blank');

            }}>
                <span>
                    <img src={mssg.src} style={{height: '25px', width: '25px', position: 'relative', borderRadius: '2.5px',marginRight: '5px'}} alt="" />
                </span>
                &nbsp;
                &nbsp;
                &nbsp;
                <span>WhatsApp</span>
            </button>

            <div onClick={e => window.location.href = `tel:+234${phone}`} style={{height: '50px', width: '45%', borderRadius: '5px', display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'center', fontSize: 'x-small', background: '#278A3D', color: '#fff'}}>
                {
                    
                    <>
                        <span>
                            <img src={phn.src} style={{height: '25px', width: '25px', position: 'relative',  margin: 'auto'}} alt="" />
                        </span>
                        &nbsp;
                        &nbsp;
                        &nbsp;
                        
                        <span style={{marginTop: '0'}}>
                            Call
                        </span>
                    </>  

                    
                }
            </div>

        </div>
    </>
  )
}
