/**
 * Admin Types
 * 
 * Type definitions for admin-related operations.
 * 
 * @module app/api/lib/types/admin
 */

export interface NewProductDoc {
    name: string,
    description: string,
    category: string,
    subcategory: string,
    brand: string,
    images: string[],
    thumbnail_url: string,
    specifications: Record<string, string>,
    admin_id: string | number
}

export interface NewServiceDoc {
    name: string,
    description: string,
    price: number,
    duration_minutes: number,
    image_url: string,
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
    summary: string,
    content: string,
    image_urls: string[],
    thumbnail_url: string,
    category: string,
    admin_id: string | number
}
