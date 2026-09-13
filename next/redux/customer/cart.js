/**
 * Admin Cookie Slice
 * 
 * Redux slice for managing customer authentication cart state.
 * Used to track and update the customer's session cart.
 * 
 * @module redux/customer/cart
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for customer cart
 * @type {Object}
 * @property {string|null} cart - The authentication cart value
 */
const initialState = {
  cart: [],
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Admin cart slice with reducers for cart management
 */
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Sets the customer cart value
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with cart payload
     */
    set_cart: (state, action) => {
      state.cart = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_cart } = cartSlice.actions;

// Export reducer as default
export default cartSlice.reducer;
