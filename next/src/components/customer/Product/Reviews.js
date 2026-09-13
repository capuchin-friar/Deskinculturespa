import React from 'react'
import StarRating from '@/files/reusable.js/star';

export default function Reviews() {
  return (
    <>
        <div className="buyer-product-reviews" style={{borderRadius: '5px', padding: '0'}}>
            <h6 className="" style={{padding:'10px', margin: '0', borderBottom: '1px solid #efefef', height: '50px', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center'}}>Reviews</h6>
            <section >
                <div className='ratings'>
                    <h6 style={{padding:'10px', margin: '0', height: '50px', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center'}}>Verfifed Rating (0)</h6>

                    <section style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <div style={{background: '#efefef', width: '100%', height: 'auto', borderRadius: '5px', padding: '10px'}}>
                            <h3 style={{textAlign: 'center', color: '#FF4500', marginBottom: '5px'}}>4.5/5.0</h3>
                            <div style={{ padding: '20px 0px', textAlign: 'center' }}>
                                <StarRating
                                    rating={4.5}
                                
                                />
                            </div>
                            <div style={{textAlign: 'center'}}>19 Verified reviews</div>
                        </div>
                        
                    </section>

                    {/* <section style={{minHeight: '200px'}}>

                    </section> */}

                    
                </div>

                <div className='comments'>
                    <h6 style={{padding:'10px', margin: '0', height: '50px', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center'}}>Comments From Verified Purchases (0)</h6>
                    

                    <section style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <div style={{borderBottom: '1px solid #efefef', width: '100%', height: '170px', borderRadius: '0', padding: '10px', background: '#fff'}}>
                            <div style={{ padding: '0px 0px', textAlign: 'left' }}>
                                <StarRating
                                    rating={4.5}
                                
                                />
                            </div>
                            <div style={{fontWeight: '400'}}>Original and effective</div>

                            <small style={{fontWeight: '300'}}>All smells great</small>
                            
                            <div style={{width: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <small style={{fontWeight: '300'}}>
                                    {
                                        new Date().toUTCString()
                                    }&nbsp; By Chinedu
                                </small>
                                <small style={{color: 'green'}}>Verified Purchase</small>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    </>
  )
}
