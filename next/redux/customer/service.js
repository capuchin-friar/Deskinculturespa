/**
 * Admin Cookie Slice
 * 
 * Redux slice for managing customer authentication service state.
 * Used to track and update the customer's session service.
 * 
 * @module redux/customer/service
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for customer service
 * @type {Object}
 * @property {string|null} service - The authentication service value
 */
const initialState = {
  service: [],
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Admin service slice with reducers for service management
 */
export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    /**
     * Sets the customer service value
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with service payload
     */
    set_service: (state, action) => {
      state.service = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_service } = serviceSlice.actions;

// Export reducer as default
export default serviceSlice.reducer;
