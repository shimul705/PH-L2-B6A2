import { pool } from "../../database/db";
import { IUserResponse, IUpdateUserRequest } from "./user.interface";

export const getAllUsers = async (): Promise<IUserResponse[]> => {
    const result = await pool.query(`SELECT id, name, email, phone, role FROM users ORDER BY id`);
    return result.rows;
};

export const getUserById = async (userId: number): Promise<IUserResponse | null> => {
    if (!userId || userId <= 0) {
        throw new Error("Invalid user ID");
    }

    const result = await pool.query(
        `SELECT id, name, email, phone, role FROM users WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

export const updateUser = async (userId: number, userData: IUpdateUserRequest): Promise<IUserResponse | null> => {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const { name, email, phone, role } = userData;


    if (name && name.length < 2) {
        throw new Error("Name must be at least 2 characters long");
    }

    if (email && !email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
        throw new Error("Invalid email format");
    }

    if (phone && phone.length < 11) {
        throw new Error("Phone number must be at least 11 characters long");
    }

    if (role && !['admin', 'customer'].includes(role)) {
        throw new Error("Role must be either 'admin' or 'customer'");
    }


    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await pool.query(
            `SELECT * FROM users WHERE email = $1 AND id != $2`,
            [email.toLowerCase(), userId]
        );

        if (existingUser.rows.length > 0) {
            throw new Error("Email already exists");
        }
    }

    const result = await pool.query(
        `UPDATE users SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      role = COALESCE($4, role)
    WHERE id = $5 RETURNING id, name, email, phone, role`,
        [name, email ? email.toLowerCase() : null, phone, role, userId]
    );

    return result.rows[0];
};

export const deleteUser = async (userId: number): Promise<void> => {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const activeBookings = await pool.query(
        `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
        [userId]
    );

    if (activeBookings.rows.length > 0) {
        throw new Error("Cannot delete user with active bookings");
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
};