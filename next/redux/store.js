/**
 * Redux Store Configuration
 * 
 * Central store configuration for the Shopiva application.
 * Combines all reducers and exports the configured store.
 * 
 * @module redux/store
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { configureStore } from "@reduxjs/toolkit";
import AdminCookieReducer from "./admin/cookie";

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

/**
 * Configured Redux store with all application reducers
 */
const store = configureStore({
  reducer: {
    admin_cookie: AdminCookieReducer
  }
});

export default store;
