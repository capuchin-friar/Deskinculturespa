/**
 * Admin Cookie Slice
 * 
 * Redux slice for managing customer authentication filters state.
 * Used to track and update the customer's session filters.
 * 
 * @module redux/customer/filters
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for customer filters
 * @type {Object}
 * @property {string|null} filters - The authentication filters value
 */
const initialState = {
    filters: {
        price: {
            min: 0,
            max: 100000000
        },
        category: "",
        subCategory: "",
        brand: "",
        id: null
    },
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Admin filters slice with reducers for filters management
 */
export const filtersSlice = createSlice({
    name: "filters",
    initialState,
    reducers: {
        /**
         * Sets the customer filters value
         * @param {Object} state - Current state
         * @param {Object} action - Redux action with filters payload
         */
        set_filters: (state, action) => {
            state.filters = action.payload;
        },
    },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_filters } = filtersSlice.actions;

// Export reducer as default
export default filtersSlice.reducer;
