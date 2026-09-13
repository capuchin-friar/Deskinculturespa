import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
// import { UpdatePickupChannel } from "@/app/api/buyer/update"

export default function PickupChannel({updateLocation,title,edit,order_data}) {
    let {buyerData} = useSelector(s=>s.buyerData)
    useEffect(() => {
        setSelectedMonth(parseInt(edit?.date?.mth));
        setDay(edit?.date?.dy);
        setState(edit?.locale?.split(',')[0])
        setCity(edit?.locale?.split(',')[1])
        setTown(edit?.locale?.split(',')[2])
        setAddress1(edit?.locale?.split(',')[3])
        setAddress2(edit?.locale?.split(',')[4])
        setAddress3(edit?.locale?.split(',')[5])
    }, [edit])
  
    let [state, setState] = useState('')
    let [town, setTown] = useState('')
    let [city, setCity] = useState('')
    let [address1, setAddress1] = useState('')
    let [address2, setAddress2] = useState('')
    let [address3, setAddress3] = useState('')
  
    let [days, setDays] = useState([]);
    let [day, setDay] = useState(null);

    let [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    let [monthsList, setMonthsList] = useState([
      {month: 'January', days: 31},
      {month: 'February', days: isLeapYear(new Date().getFullYear()) ? 29 : 28},
      {month: 'March', days: 31},
      {month: 'April', days: 30},
      {month: 'May', days: 31},
      {month: 'June', days: 30},
      {month: 'July', days: 31},
      {month: 'August', days: 31},
      {month: 'September', days: 30},
      {month: 'October', days: 31},
      {month: 'November', days: 30},
      {month: 'December', days: 31}
    ]);
  
    function isLeapYear(year) {return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);}
  
  
    useEffect(() => {
      let num = monthsList[selectedMonth]?.days
  
     
      if(new Date().getMonth() === parseInt(selectedMonth)){
        setDays([])
        let d = new Date().getDate();
        for(let i=d;i<(num+1);i++){
            if(parseInt(day) === i){
                setDays(day=> [...day,<option selected value={i} >
                    {
                        i 
                    } 
                </option>])
          }else{
                setDays(day=> [...day,<option value={i} >
                    {
                        i 
                    } 
                </option>])
        }
        }
      }else{
        setDays([])
        for(let i=1;i<(num+1);i++){
            if(parseInt(day) === i){
                setDays(day=> [...day,<option selected value={i} >
                    {
                      i 
                    } 
                </option>])
              }else{
                setDays(day=> [...day,<option value={i} >
                    {
                      i 
                    } 
                </option>])
              }
        }
      }
         
    }, [selectedMonth]) 
  
  
    function addLocation() {
       
      let res = ({locale: [state,city,address1,address2,address3].map(item=>item).join(', '), date: {yr: new Date().getFullYear(), mth: selectedMonth, dy: day}})
      updateLocation(res)
      rmLocation()
       
    }

    async function editPickupChannel() {
        // let response = await UpdatePickupChannel({
        //     user_id: buyerData?.user_id, 
        //     product_id: order_data?.product_id, 
        //     pickup_channel:  {
        //         channel: edit?.channel, 
        //         locale: [state,city,town,address1,address2,address3].map(item=>item).join(', '), 
        //         date: {yr: new Date().getFullYear(), mth: selectedMonth, dy: day},
        //         index: edit?.index
        //     }
        // })
        // if(response.success){
        //     updateLocation(response.locale)
        // }
    }
  
    function rmLocation() {
        let overlay = document.querySelector('.location-overlay')
        overlay.removeAttribute('id');
    }
  
    return( 
        <>
           
            <div style={{background: '#fff', width: 'fit-content', padding: '10px', position: 'relative', height: '80%', borderRadius: '10px'}}>
              <h2 style={{padding: '10px', color: '#FF4500', fontWeight: '500'}}><u>Input Your {title} Location </u></h2>
                <section style={{padding: '10px', overflow: 'auto', height: 'calc(100% - 100px)'}}>
                    <div className="input-cnt">
                        <label htmlFor="">State</label>
                        <input onInput={e => setState(e.target.value)} defaultValue={edit?.locale?.split(',')[0]} type="text" name="" id="" />
                    </div>
  
                    <div className="input-cnt">
                        <label htmlFor="">City</label>
                        <input onInput={e => setCity(e.target.value)} defaultValue={edit?.locale?.split(',')[1]} type="text" name="" id="" />
                    </div>
  
                    <div className="input-cnt">
                        <label htmlFor="">Town</label>
                        <input onInput={e => setTown(e.target.value)} defaultValue={edit?.locale?.split(',')[2]} type="text" name="" id="" />
                    </div>
  
                    <div className="input-cnt">
                        <label htmlFor="">Address 1(Street Name)</label>
                        <input onInput={e => setAddress1(e.target.value)} defaultValue={edit?.locale?.split(',')[3]} type="text" name="" id="" />
                    </div>
  
                    <div className="input-cnt">
                        <label htmlFor="">Address 2(Bus Stop/Junction)</label>
                        <input onInput={e => setAddress2(e.target.value)} defaultValue={edit?.locale?.split(',')[4]} type="text" name="" id="" />
                    </div>
  
                    <div className="input-cnt">
                        <label htmlFor="">Address 3(Extra details like building land mark)</label>
                        <input onInput={e => setAddress3(e.target.value)} defaultValue={edit?.locale?.split(',')[5]} type="text" name="" id="" />
                    </div>
  
                    <section style={{padding: '10px', fontSize: '12', width: '100%', fontWeight: '400', display: 'flex', alignItems: 'center', justifyContent: 'space-between',}}>
                      <div className="input-cnt" style={{width: '30%', }}>
                        <label htmlFor="">Year</label>
                        <select style={{width: '100%', fontSize: 'small', padding: '5px'}} name="" id="">
                          <option value="">Year</option>
                          {
                            new Date().getMonth() === 11
                            ?
                              <>
                                <option selected value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                <option value={parseInt(new Date().getFullYear()) + 1}>{parseInt(new Date().getFullYear()) + 1}</option>
                              </>
                            :
                            <option selected value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                          }
                        </select>
                        {/* <input style={{width: '100%', fontSize: 'small'}} value={new Date().getFullYear()} type="text" /> */}
                      </div>
                      <div className="input-cnt" style={{width: '40%', }}>
                        <label htmlFor="">Month</label>
                        <select style={{width: '100%', fontSize: 'small'}} onInput={e=>setSelectedMonth(e.target.value)} name="" id="">
                          <option value="">Month</option>
                          {
                            monthsList.map((item,index) => 
                              index >= new Date().getMonth()
                              ?
                              parseInt(selectedMonth) === parseInt(index)
                              ?
                              <option style={{textTransform: 'capitalize'}} selected value={index}>
                                {
                                  item.month
                                }
                              </option>
                              
                              :
                              <option style={{textTransform: 'capitalize'}} value={index}>
                                {
                                  item.month
                                }
                              </option>
                              :
                              ''
                            )
                          }
                        </select>
                      </div>
                      <div className="input-cnt" style={{width: '30%', }}>
                        <label htmlFor="">Day</label>
                        <select style={{width: '100%', fontSize: 'small'}} onInput={e=>setDay(e.target.value)} name="" id="">
                          <option value="">Day</option>
                          {
                            days
                          }
                        </select>
                      </div>
                    </section>
                </section>
  
                <div style={{display: 'flex', alignItems: 'center', fontWeight: '500', padding: '10px', fontSize: '20', justifyContent: 'space-between', flexDirection: 'row', background: '#fff', position: 'absolute', bottom: '0', left: '0', width: '100%'}}>
                    <button onClick={e => {
                        edit
                        ?
                        editPickupChannel()
                        :
                        addLocation()
                    }} style={{width: '48%'}}>{
                        edit
                        ?
                        'Update'
                        :
                        'Add'
                    }</button>
                    <button onClick={e => rmLocation()} style={{width: '48%'}}>Cancel</button>
                </div>
            </div>
        </> 
    )
}