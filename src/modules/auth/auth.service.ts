import { pool } from "../../database/db";
import jwt from "jsonwebtoken";
import { ISignupRequest, IUser, IAuthResponse } from "./auth.interface";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export const createUser = async (userData: ISignupRequest): Promise<IUser> => {
    const { name, email, password, phone, role } = userData;


    if (!name || name.length < 2) {
        throw new Error("Name must be at least 2 characters long");
    }

    if (!email || !email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
        throw new Error("Invalid email format");
    }

    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (!phone || phone.length < 11) {
        throw new Error("Phone number must be at least 11 characters long");
    }

    const userRole = role || 'customer';
    if (!['admin', 'customer'].includes(userRole)) {
        throw new Error("Role must be either 'admin' or 'customer'");
    }


    const existingUser = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, email.toLowerCase(), hashedPassword, phone, userRole]
    );

    delete result.rows[0].password;
    return result.rows[0];
};

export const loginUser = async (email: string, password: string): Promise<IAuthResponse> => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    delete user.password;

    return { token, user };
};