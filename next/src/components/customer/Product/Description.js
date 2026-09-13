const Description = ({item}) => {

    return ( 
        <>
            <div className="buyer-product-description" style={{borderRadius: '5px', padding: '0'}}>
                <h6 className="" style={{padding:'10px', margin: '0', borderBottom: '1px solid #efefef', height: '50px', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center'}}>Description</h6>
                <section style={{padding: '20px', fontSize: 'medium', fontWeight: '400', background: '#fff'}}>
                    {item?.description}
                </section>
            </div>
        </>
     );
}
 
export default Description;