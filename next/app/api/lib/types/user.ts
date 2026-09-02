/**
 * User Types
 * 
 * Type definitions for user-related operations.
 * 
 * @module app/api/lib/types/user
 */

export interface NewUserDocument {
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

export type UserRole = "customer" | "user";

export type AccountStatus = "active" | "suspended" | "banned" | "deleted";

export interface UserLocation {
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

export interface User {
    id: number;
    role: UserRole;
    fname: string;
    lname: string;
    email: string;
    phone?: string;
    gender?: string;
    photo?: string;
    bio?: string;
    location?: UserLocation;
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
