"use client"
import React, { useEffect, useState } from 'react'
import '@/app/store/cart/styles/xx-large.css'
import '@/app/store/cart/styles/x-large.css'
import '@/app/store/cart/styles/large.css'
import '@/app/store/cart/styles/medium.css'
import '@/app/store/cart/styles/small.css'
import { useSelector } from 'react-redux'
import { Cart } from '../../../src/components/customer/Cart/Cart'

export default function page() {

  return (
    <>
      <div className="buyer-cart-cnt" style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', background: '#f9f9f9'}}>
            <Cart />      
        </div> 
    </>
  )
}
