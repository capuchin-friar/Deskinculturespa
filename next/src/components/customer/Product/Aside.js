import React, { useEffect, useRef, useState } from 'react'
import { IoLocationSharp, IoReturnDownForward } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
// import { setPickupChannelTo } from '@/redux/buyer_store/pickup_channel';
// import returnSvg from '@/files/assets/return-svgrepo-com.svg';
// import deliverySvg from '@/files/assets/delivery-svgrepo-com (1).svg'
// import nextSvg from '@/files/assets/back-svgrepo-com (3).svg'
export default function Aside({item,order_list,seller}) {
  let [locale, setLocale] = useState([]);
  let [pickUpChannel, setpickUpChannel] = useState('');
  let [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {let width = window.innerWidth;setScreenWidth(width)}, []);

  // let {buyerData} = useSelector(s => s.buyerData)
  let [shippingRange, setShippingRange] = useState(item?.shipping_range ? JSON.parse(item.shipping_range) : null)

  useEffect(() => {
    console.log('product: ', seller)
  }, [seller])

  let dispatch = useDispatch()

  function addLocation(channel) {
    let buyer = window.localStorage.getItem('CE_user_id');
    if(buyer === null || buyer === '' || buyer === 'null'){
      window.location.href=(`/login?page=product&data=${item.product_id}`)
    }else{
      setpickUpChannel(channel)
      let overlay = document.querySelector('.location-overlay')
      overlay.setAttribute('id', 'location-overlay');
    }
  }

  function deleteLocation(data) {
    let newLocaleList = locale.filter(item => item.index !== data)
    setLocale(newLocaleList)
  }
  function updateLocation(data) {
    setLocale(item => [...item,{channel: pickUpChannel, locale: data.locale, date: data.date, index: locale.length}])
  }

 let list = useRef(
  [
    {month: 'january'},
    {month: 'february'},
    {month: 'march'},
    {month: 'april'},
    {month: 'may'},
    {month: 'june'},
    {month: 'july'},
    {month: 'august'},
    {month: 'september'},
    {month: 'october'},
    {month: 'november'},
    {month: 'december'}
  ]
 )

 useEffect(() => {
  // setPickupChannel(locale)
  // dispatch(setPickupChannelTo(locale))
 },[locale])

  return (
    <>
        <div className="buyer-product-aside" style={{padding: '0px', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'flex-start', height: 'auto', width: '100%', background: '#f9f9f9'}}>
          <div style={{padding: '0px', width: '100%', background: '#fff'}}>
            <h6 className="" style={{padding:'10px', margin: '0', borderBottom: '1px solid #efefef', height: '50px', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center'}}>Delivery & Returns</h6>
            <div style={{margin: '0px', width: '100%'}}>
              <section style={{width: '100%'}}>
                

                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%', padding: '10px', width: screenWidth >= 659 && screenWidth <= 999 ? '50%' : '100%', float: 'left'}}>
                  <small className="" style={{padding:'0px', margin: '0', height: '50px', width: '100%', background: '#fff', fontWeight: '500', display: 'flex', alignItems: 'center'}}>Deliver Range</small>
                  {/* <div className="input-cnt" style={{marginBottom: '10px', width: '100%'}}>
                    <select name="" id="" style={{width: '100%', height: '50px'}}>
                      <option value="">Select State</option>
                    </select>
                  </div>

                  <div className="input-cnt" style={{marginBottom: '10px', width: '100%'}}>
                    <select name="" id="" style={{width: '100%', height: '50px'}}>
                      <option value="">Select Town</option>
                    </select>
                  </div> */}

                    
                <div className="shadow-md" style={{ padding: '10px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* In Campus */}
                  {shippingRange?.in_campus?.selected && (
                    <div>
                      + Shipping fee: from {seller?.campus} only for ₦
                      {new Intl.NumberFormat('en-US').format(shippingRange.in_campus.price)}
                    </div>
                  )}

                  {/* In State */}
                  {shippingRange?.in_state?.selected ? (
                    <div>
                      Ships within {seller?.state} only for ₦
                      {new Intl.NumberFormat('en-US').format(shippingRange.in_state.price)}
                    </div>
                  ) : (
                    <div>Does Not Ship Outside {seller?.campus}</div>
                  )}

                  {/* Out State */}
                  {shippingRange?.out_state?.selected ? (
                    <div>
                      Ships in and outside {seller?.state} for ₦
                      {new Intl.NumberFormat('en-US').format(shippingRange.out_state.price)}
                    </div>
                  ) : (
                    <div>Does Not Ship Outside {seller?.state}</div>
                  )}
                </div>


                </div>

                <div className="input-cnt" style={{marginBottom: '10px', width: screenWidth >= 659 && screenWidth <= 999 ? '50%' : '100%', padding: '10px', height: 'auto', float: 'right'}}>
                  <small className="" style={{padding:'0px', margin: '0', height: '50px', width: '100%', background: '#fff', fontWeight: '500', display: 'flex', alignItems: 'center'}}>Delivery Data</small>
                  <section style={{display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', border: '1px solid #efefef'}}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <IoLocationSharp size={25} />
                    </div>

                    <div style={{padding: '0px 8px', width: 'calc(100% - 40px)', display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>

                      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'row', marginBottom: '5px'}}>
                        <small style={{fontWeight: '500'}}>Pickup Station</small>
                        <small style={{fontSize: 'small'}}>Details</small>
                      </div>

                      <div style={{fontSize: '12px', justifyContent: 'flex-start', lineHeight: '15px', width: '100%', marginBottom: '5px'}}>Delivery Fees ₦ 600</div>

                      <div style={{fontSize: '12px', width: '100%', lineHeight: '15px'}}>Arriving at pickup station between 07 August & 09 August when you order within next 9hrs 22mins</div>

                    </div>
                  </section>

                  <section style={{display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', border: '1px solid #efefef'}}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <IoReturnDownForward size={25} />
                    </div>
                    <div style={{padding: '0px 8px', width: 'calc(100% - 40px)', display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>
                      <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '5px'}}>
                        <small style={{fontWeight: '500'}}>Return Policy</small>
                        <small style={{fontSize: 'small'}}>Details</small>
                      </div>

                      <div style={{fontSize: '12px', width: '100%', lineHeight: '15px', textAlign: 'left', justifyContent: 'flex-start'}}>{item?.accept_refund === 'yes' ? 'Accepts Refund' : 'Does Not Accept Refund' }</div>
                    </div>
                  </section> 
                </div>
              </section>

              
            </div>
          </div>
        </div>
    </>
  )
}






