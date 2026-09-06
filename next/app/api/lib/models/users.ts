/**
 * USER MODEL
 * 
 * Handles all database operations related to users:
 * - User creation and authentication
 * - Profile information updates (email, phone, password, photo)
 * - User data retrieval and validation
 * 
 * @module app/api/lib/models/user
 */

import { query } from "../database";
import type { NewUserDocument, User } from "../types/user";
import { withErrorHandling } from "../utils/errHandler";

export class UsersModel {

    static getAlUsers = withErrorHandling(async (payload: { id: string | number }): Promise<User[]> => {
        // Ensure id is admin
        const { id } = payload;
        const { rows } = await query(
            `SELECT COUNT(*) AS count FROM users WHERE role = $1 AND id = $2`,
            ["admin", id]
        );

        const count = Number(rows[0].count);

        if (count > 0) {
            const { rows: users } = await query(
                `SELECT * FROM users`
            );

            return users;
        }

        throw new Error("Unauthorized access!");
    });
}

