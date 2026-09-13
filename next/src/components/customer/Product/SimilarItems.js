import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import CardCnt from "./CardCnt"
import { GetItems } from "@/app/api/buyer/get"
import { usePathname } from "next/navigation"

const SimilarItems = ({category,product_id}) => {

    let [role, setRole] = useState(0)
    let [items, setItems] = useState([])
    let pathname = usePathname()
    useEffect(() => {
        if(window.location.search !== ''){
            setRole(1)
        }else{
            setRole(0)
        }
    }, [pathname])

    useEffect(() => {
        
        try {
           async function getData() {
            let result = await GetItems(category)
            console.log(result)
            
            let data = result?.length > 0 ? result.filter(item => (item.product_id !== product_id)) : []
            console.log(data)

            setItems(data)
           }
           getData()
        } catch (error) {
            console.log(error)
        }

    }, [category])
    return ( 
        <>
            {
                items.length > 0
                ?
                <div className="buyer-product-related-items">
                    <h6 style={{padding:'10px'}}>Similar Items You May Like</h6>

                    <CardCnt category={category} items={items} />   
                
                </div>
                :
                ''
            }
        </>
     );
}
 
export default SimilarItems;