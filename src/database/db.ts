import { Pool } from "pg";
import dotenv from "dotenv";


dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(250) NOT NULL CHECK (LENGTH(name) >= 2),
                email VARCHAR(150) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
                password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
                phone VARCHAR(255) NOT NULL CHECK (LENGTH(phone) >= 10),
                role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer'))
            )
        `);
        console.log("Database Connected");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles(
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(250) NOT NULL CHECK (LENGTH(vehicle_name) >= 2),
                type VARCHAR(50) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
                registration_number VARCHAR(150) UNIQUE NOT NULL,
                daily_rent_price INTEGER NOT NULL CHECK (daily_rent_price > 0),
                availability_status VARCHAR(50) NOT NULL CHECK (availability_status IN ('available', 'booked'))
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings(
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL,
                vehicle_id INTEGER NOT NULL,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
                total_price INTEGER NOT NULL CHECK (total_price > 0),
                status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned')),
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
};