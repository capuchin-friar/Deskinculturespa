/**
 * USER MODEL
 * 
 * Handles all database operations related to users:
 * - Admin creation and authentication
 * - Profile information updates (email, phone, password, photo)
 * - Admin data retrieval and validation
 * 
 * @module app/api/lib/models/user
 */

import { query } from "../database";
import type { NewAdminDocument, Admin } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

export class AdminModel {
  static createAdminDoc = withErrorHandling(
    async (
      payload: NewAdminDocument
    ) => {
      const { role, fname, lname, email, password, phone } = payload;

      const columns = ["role", "fname", "lname", "email", "phone", "password", "createdAt"];

      const values = [role, fname, lname, email, phone, password, new Date()];

      const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

      const sql = `INSERT INTO users (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;

      const { rows } = await query(sql, values);

      return rows[0];
    }
  );

  static findAdminByEmail = withErrorHandling(async (email: string): Promise<Admin[]> => {
    const { rows } = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return rows;
  });

  /** Case-insensitive match (avoids 401 when DB email casing differs from login input). */
  static findAdminByEmailNormalized = withErrorHandling(async (email: string): Promise<Admin[]> => {
    const { rows } = await query(
      `SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
      [email]
    );
    return rows;
  });

  static countEmail = withErrorHandling(async (email: string): Promise<number> => {
    const { rows } = await query(
      `SELECT COUNT(*) as count FROM users WHERE email = $1`,
      [email]
    );
    return parseInt(rows[0].count);
  });

  static countPhone = withErrorHandling(async (phone: string): Promise<number> => {
    const { rows } = await query(
      `SELECT COUNT(*) as count FROM users WHERE phone = $1`,
      [phone]
    );
    return parseInt(rows[0].count);
  });

  static findAdminById = withErrorHandling(async (id: number): Promise<Admin[]> => {
    const { rows } = await query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return rows;
  });

  static updateAdminPhoneById = withErrorHandling(async (id: number, phone: string) => {
    const { rows } = await query(
      `UPDATE users SET phone = $1 WHERE id = $2 RETURNING *`,
      [phone, id]
    );
    return rows;
  });

  static updateAdminRoleById = withErrorHandling(async (id: number, role: string) => {
    const { rows } = await query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
      [role, id]
    );
    return rows;
  });

  static updateAdminEmailById = withErrorHandling(async (id: number, email: string) => {
    const { rows } = await query(
      `UPDATE users SET email = $1 WHERE id = $2 RETURNING *`,
      [email, id]
    );
    return rows;
  });

  static updateProfile = withErrorHandling(
    async (payload: Partial<NewAdminDocument> & { id: number }) => {
      const { fname, lname, id } = payload;

      const { rows } = await query(
        `UPDATE users SET fname=$1, lname=$2 WHERE id = $3 RETURNING *`,
        [fname, lname, id]
      );

      return rows;
    }
  );

  static deleteProfile = withErrorHandling(
    async (payload: { id: number }) => {
      const { id } = payload;

      const { rows } = await query(
        `
          UPDATE users
          SET 
          accountStatus = $1,
          status = jsonb_set(
              jsonb_set(
                  status,
                  '{deleted,enabled}',
                  'true'::jsonb,
                  true
              ),
              '{deleted,history}',
              COALESCE(status->'deleted'->'history', '[]'::jsonb) || to_jsonb(NOW()),
              true
          )
          WHERE id = $2
          RETURNING *
        `,
        ["deleted", id]
      );

      return rows;
    }
  );

  static recreateProfile = withErrorHandling(async (payload: { id: number }) => {
    const { id } = payload;

    const { rows } = await query(
      `
        UPDATE users
        SET
        accountStatus = 'active',
        status = jsonb_set(
            jsonb_set(
                jsonb_set(
                    status,
                    '{recreated,enabled}',
                    'true'::jsonb,
                    true
                ),
                '{recreated,history}',
                COALESCE(status->'recreated'->'history', '[]'::jsonb) || to_jsonb(NOW()),
                true
            ),
            '{deleted,enabled}',
            'false'::jsonb,
            true
        )
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    return rows[0];
  });

  static updatePassword = withErrorHandling(
    async (payload: { id: number; password: string }) => {
      const { password, id } = payload;
      const { rows } = await query(
        `UPDATE users SET password=$1 WHERE id = $2 RETURNING *`,
        [password, id]
      );
      return rows;
    }
  );

  static updatePhoto = withErrorHandling(async (payload: { photo: string; id: number }) => {
    const { photo, id } = payload;
    const { rows } = await query(
      `UPDATE users SET photo = $1 WHERE id = $2 RETURNING *`,
      [photo, id]
    );
    return rows;
  });

  static recordFailedLoginAttempt = withErrorHandling(async (id: number) => {
    const { rows } = await query(
      `
        UPDATE users 
        SET loginAttempts = jsonb_set(
            jsonb_set(
              COALESCE(loginAttempts, '{}'::jsonb),
              '{count}',
              (COALESCE(loginAttempts->>'count', '0')::int + 1)::text::jsonb
            ),
            '{lastAttempt}',
            to_jsonb(NOW())
          ),
          updatedAt = NOW()
        WHERE id = $1 
        RETURNING *
      `,
      [id]
    );
    return rows;
  });

  static resetLoginAttempts = withErrorHandling(async (id: number) => {
    const { rows } = await query(
      `
        UPDATE users 
        SET loginAttempts = jsonb_set(
            loginAttempts,
            '{count}',
            '0'::jsonb
        ),
        updatedAt = NOW()
        WHERE id = $1 
        RETURNING *
      `,
      [id]
    );
    return rows;
  });

  static updateLastLogin = withErrorHandling(async (id: number) => {
    const { rows } = await query(
      `
        UPDATE users 
        SET lastLogin = NOW(), 
            lastseen = NOW(),
            updatedAt = NOW()
        WHERE id = $1 
        RETURNING *
      `,
      [id]
    );
    return rows;
  });

  /**
   * Find or create user for OAuth providers (Google, Apple, Facebook)
   */
  static findOrCreateOAuthAdmin = withErrorHandling(
    async (payload: {
      email: string;
      fname: string;
      lname: string;
      provider: string;
      role: string;
    }) => {
      const { email, fname, lname, provider, role } = payload;

      // Check if user exists
      const existingAdmins = await AdminModel.findAdminByEmail(email);

      if (existingAdmins.length > 0) {
        const user = existingAdmins[0];
        
        // If user was deleted, reactivate
        if (user.accountStatus === "deleted") {
          await AdminModel.recreateProfile({ id: user.id });
          const updatedAdmins = await AdminModel.findAdminById(user.id);
          return updatedAdmins[0];
        }
        
        // Update last login
        await AdminModel.updateLastLogin(user.id);
        return user;
      }

      // Create new user for OAuth
      const { rows } = await query(
        `
          INSERT INTO users (role, fname, lname, email, password, provider, createdAt, isEmailVerified)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
          RETURNING *
        `,
        [role, fname, lname, email, "oauth_" + provider, provider]
      );

      return rows[0];
    }
  );
}

