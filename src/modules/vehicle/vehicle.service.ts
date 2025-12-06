import { pool } from "../../database/db";
import { IVehicle, ICreateVehicleRequest, IUpdateVehicleRequest } from "./vehicle.interface";

export const createVehicle = async (vehicleData: ICreateVehicleRequest): Promise<IVehicle> => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;


    if (!vehicle_name || vehicle_name.length < 2) {
        throw new Error("Vehicle name must be at least 2 characters long");
    }

    if (!['car', 'bike', 'van', 'SUV'].includes(type)) {
        throw new Error("Vehicle type must be 'car', 'bike', 'van', or 'SUV'");
    }

    if (!registration_number || registration_number.trim().length === 0) {
        throw new Error("Registration number is required");
    }

    if (!daily_rent_price || daily_rent_price <= 0) {
        throw new Error("Daily rent price must be greater than 0");
    }

    const status = availability_status || 'available';
    if (!['available', 'booked'].includes(status)) {
        throw new Error("Availability status must be 'available' or 'booked'");
    }



    const existingVehicle = await pool.query(
        `SELECT * FROM vehicles WHERE registration_number = $1`,
        [registration_number]
    );

    if (existingVehicle.rows.length > 0) {
        throw new Error("Registration number already exists");
    }

    const result = await pool.query(
        `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [vehicle_name, type, registration_number, daily_rent_price, status]
    );

    return result.rows[0];
};

export const getAllVehicles = async (): Promise<IVehicle[]> => {
    const result = await pool.query(`SELECT * FROM vehicles ORDER BY id`);
    return result.rows;
};

export const getVehicleById = async (vehicleId: number): Promise<IVehicle | null> => {
    if (!vehicleId || vehicleId <= 0) {
        throw new Error("Invalid vehicle ID");
    }

    const result = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [vehicleId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

export const updateVehicle = async (vehicleId: number, vehicleData: IUpdateVehicleRequest): Promise<IVehicle | null> => {
    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
        throw new Error("Vehicle not found");
    }

    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;


    if (vehicle_name && vehicle_name.length < 2) {
        throw new Error("Vehicle name must be at least 2 characters long");
    }

    if (type && !['car', 'bike', 'van', 'SUV'].includes(type)) {
        throw new Error("Vehicle type must be 'car', 'bike', 'van', or 'SUV'");
    }

    if (daily_rent_price && daily_rent_price <= 0) {
        throw new Error("Daily rent price must be greater than 0");
    }

    if (availability_status && !['available', 'booked'].includes(availability_status)) {
        throw new Error("Availability status must be 'available' or 'booked'");
    }


    if (registration_number && registration_number !== vehicle.registration_number) {
        const existingVehicle = await pool.query(
            `SELECT * FROM vehicles WHERE registration_number = $1 AND id != $2`,
            [registration_number, vehicleId]
        );

        if (existingVehicle.rows.length > 0) {
            throw new Error("Registration number already exists");
        }
    }

    const result = await pool.query(
        `UPDATE vehicles SET 
      vehicle_name = COALESCE($1, vehicle_name),
      type = COALESCE($2, type),
      registration_number = COALESCE($3, registration_number),
      daily_rent_price = COALESCE($4, daily_rent_price),
      availability_status = COALESCE($5, availability_status)
    WHERE id = $6 RETURNING *`,
        [vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId]
    );

    return result.rows[0];
};

export const deleteVehicle = async (vehicleId: number): Promise<void> => {
    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
        throw new Error("Vehicle not found");
    }

    const activeBookings = await pool.query(
        `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
        [vehicleId]
    );

    if (activeBookings.rows.length > 0) {
        throw new Error("Cannot delete vehicle with active bookings");
    }

    await pool.query(`DELETE FROM vehicles WHERE id = $1`, [vehicleId]);
};