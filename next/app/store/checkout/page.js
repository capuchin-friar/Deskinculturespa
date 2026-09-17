"use client"

import "./styles/xxl.css";
import "./styles/g.css";
import locations from "../../../src/json/location.json";
import { useEffect, useState } from "react";
import CartSummary from "../../../src/components/customer/Checkout";

export default function () {

    let [parsedLocation, setParsedlocation] = useState([]);

    let [stateList, setStateList] = useState([])
    let [townList, setTownList] = useState([])

    let [state, setState] = useState("")
    let [town, setTown] = useState("")

    useEffect(() => {
        let d = locations.map(item => Object.entries(item).map(([key, value], i) => value));
        setParsedlocation(d)
    }, []);

    useEffect(() => {
        let s = parsedLocation.map(l => l[0]);
        setStateList(s);
    }, [parsedLocation]);

    useEffect(() => {
        let t = parsedLocation.filter(l => l[0].toLowerCase() == state.toLowerCase());
        let r = t[0];
        if (r) {
            let l = (r[1]);
            setTownList(l);
        }
    }, [state]);

    return (
        <>

            <div className="customer-checkout-cnt">
                <div className="customer-checkout-info">
                    <div className="customer-checkout-user_info">
                        <h4>Customer Details</h4>
                        <div className="group-input-cnt">
                            <div className="input-cnt">
                                <label htmlFor="">Firstname</label>
                                <input type="text" name="" id="" />
                            </div>
                            <div className="input-cnt">
                                <label htmlFor="">Lastname</label>
                                <input type="text" name="" id="" />
                            </div>
                        </div>
                        <div className="group-input-cnt">
                            <div className="input-cnt">
                                <label htmlFor="">Email</label>
                                <input type="text" name="" id="" />
                            </div>
                            <div className="input-cnt">
                                <label htmlFor="">Phone</label>
                                <input type="text" name="" id="" />
                            </div>
                        </div>
                    </div>
                    <div className="customer-checkout-user_addr">
                        <h4>Customer Address</h4>

                        <div className="input-cnt">
                            <label htmlFor="">State</label>
                            <select name="" id="" onChange={e => setState(e.target.value)}>
                                <option value="">Select your state</option>
                                {
                                    stateList.map((s, i) =>
                                        <option value={s}>{s}</option>
                                    )
                                }
                            </select>
                        </div>
                        <div className="input-cnt">
                            <label htmlFor="">Town</label>
                            <select name="" id="">
                                <option value="">Select your town</option>
                                {
                                    townList.map((s, i) =>
                                        <option value={s}>{s}</option>
                                    )
                                }
                            </select>
                        </div>
                        <div className="input-cnt">
                            <label htmlFor="">Street</label>
                            <input type="text" name="" id="" />
                        </div>
                        {/* <div className="input-cnt">
                            <label htmlFor="">Zipcode</label>
                            <input type="text" name="" id="" />
                        </div> */}

                    </div>
                </div>

                <div className="customer-checkout-summary">
                    <CartSummary />
                </div>
            </div>
        </>
    )
}

