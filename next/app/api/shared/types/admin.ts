/**
 * Admin Types
 * 
 * Type definitions for admin-related operations.
 * 
 * @module app/api/shared/types/admin
 */

import type { JsonValue } from "../database";

export interface NewProductDoc {
    name: string,
    description: string,
    price: number,
    stock: number,
    category: string,
    subcategory: string,
    brand: string,
    images: string[],
    thumbnail_url: string,
    specifications: Record<string, string>,
    admin_id: string | number
}

export interface NewServiceDoc {
    specifications: Record<string, JsonValue>,
    description: string,
    price: number,
    duration_minutes: number,
    image_url: string,
    service: string,
    sub_service: string,
    admin_id: string | number
}

export interface NewAppointmentDoc {
    mode: string,
    duration_minutes: number,
    price: number,
    admin_id: string | number
}

export interface NewBlogDoc {
    title: string,
    summary: string | null,
    content: string,
    image_urls: string[],
    thumbnail_url: string | null,
    category: string,
    admin_id: string | number
}
