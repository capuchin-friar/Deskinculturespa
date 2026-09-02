/**
 * Admin Types
 * 
 * Type definitions for admin-related operations.
 * 
 * @module app/api/lib/types/admin
 */

export interface NewAdminDocument {
    fname: string,
    lname: string,
    email: string,
    phone?: string | null,
    password: string,
    role: string
}

export interface AuthData {
    email: string;
    password: string;
}

export type AdminRole = "customer" | "admin";

export type AccountStatus = "active" | "suspended" | "banned" | "deleted";

export interface AdminLocation {
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
}

export interface NotificationPreferences {
    email: {
        enabled: boolean;
        marketing: boolean;
        updates: boolean;
    };
    sms: {
        enabled: boolean;
        critical: boolean;
    };
    push: {
        enabled: boolean;
        marketing: boolean;
    };
}

export interface SocialLinks {
    facebook?: string;
    tiktok?: string;
    instagram?: string;
}

export interface Admin {
    id: number;
    role: AdminRole;
    fname: string;
    lname: string;
    email: string;
    phone?: string;
    gender?: string;
    photo?: string;
    bio?: string;
    location?: AdminLocation;
    dateOfBirth?: Date;
    password: string;
    verificationCode?: string | null;
    resetPasswordToken?: string | null;
    isActive: boolean;
    isVerified: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    accountStatus: AccountStatus;
    notificationPreferences: NotificationPreferences;
    lastseen?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    socialLinks?: SocialLinks;
    profileCompletion?: number;
}


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
