/**
 * Admin Cookie Slice
 * 
 * Redux slice for managing admin authentication cookie state.
 * Used to track and update the admin's session cookie.
 * 
 * @module redux/admin/admin_cookie
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for admin cookie
 * @type {Object}
 * @property {string|null} admin_cookie - The authentication cookie value
 */
const initialState = {
  admin_cookie: null,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Admin cookie slice with reducers for cookie management
 */
export const adminCookieSlice = createSlice({
  name: "admin_cookie",
  initialState,
  reducers: {
    /**
     * Sets the admin cookie value
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with cookie payload
     */
    set_admin_cookie: (state, action) => {
      state.admin_cookie = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_admin_cookie } = adminCookieSlice.actions;

// Export reducer as default
export default adminCookieSlice.reducer;
