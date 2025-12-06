
import { pool } from "../../database/db";
import { ICreateBookingRequest, IBookingWithDetails, IUpdateBookingRequest } from "./booking.interface";

// When the booking API is hit we can run a quick cleaner that marks expired bookings
// as returned based on Bangladesh local date. This is intentionally simple and
// safe: it logs errors but does not throw, and it ensures vehicles become
// available if there are no other active bookings.
export const markExpiredBookings = async (): Promise<void> => {
    try {
        // get Bangladesh-local today (midnight)
        const bdNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
        bdNow.setHours(0, 0, 0, 0);
        const bdDateStr = bdNow.toISOString().split('T')[0]; // YYYY-MM-DD

        const expired = await pool.query(
            `SELECT id, vehicle_id FROM bookings WHERE status = 'active' AND rent_end_date < $1`,
            [bdDateStr]
        );

        if (expired.rows.length === 0) return;

        for (const b of expired.rows) {
            await pool.query(`UPDATE bookings SET status = 'returned' WHERE id = $1`, [b.id]);

            // if no other active bookings for this vehicle, mark available
            const otherActive = await pool.query(
                `SELECT 1 FROM bookings WHERE vehicle_id = $1 AND status = 'active' LIMIT 1`,
                [b.vehicle_id]
            );

            if (otherActive.rows.length === 0) {
                await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [b.vehicle_id]);
            }
        }
    } catch (err) {
        // don't block booking flow on scheduler errors
        console.error('markExpiredBookings error:', err);
    }
};

export const createBooking = async (bookingData: ICreateBookingRequest): Promise<IBookingWithDetails> => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = bookingData;

    // Run quick cleanup to mark any expired bookings as returned (Bangladesh time)
    await markExpiredBookings();


    if (!customer_id || customer_id <= 0) {
        throw new Error("Invalid customer ID");
    }

    if (!vehicle_id || vehicle_id <= 0) {
        throw new Error("Invalid vehicle ID");
    }

    if (!rent_start_date || !rent_end_date) {
        throw new Error("Start date and end date are required");
    }


    const customerResult = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [customer_id]
    );

    if (customerResult.rows.length === 0) {
        throw new Error("Customer not found");
    }


    const vehicleResult = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
        throw new Error("Vehicle not found");
    }

    const vehicle = vehicleResult.rows[0];

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    // Get Bangladesh time
    const bdTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const today = new Date(bdTime);
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
        throw new Error("Start date cannot be in the past");
    }

    if (endDate <= startDate) {
        throw new Error("End date must be after start date");
    }


    const conflictingBookings = await pool.query(
        `SELECT * FROM bookings 
         WHERE vehicle_id = $1 
         AND status = 'active'
         AND (
           (rent_start_date <= $2 AND rent_end_date >= $2) OR
           (rent_start_date <= $3 AND rent_end_date >= $3) OR
           (rent_start_date >= $2 AND rent_end_date <= $3)
         )`,
        [vehicle_id, rent_start_date, rent_end_date]
    );

    if (conflictingBookings.rows.length > 0) {
        throw new Error("Vehicle is already booked for the selected dates");
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    if (days <= 0) {
        throw new Error("Invalid rental period");
    }

    const total_price = vehicle.daily_rent_price * days;

    const result = await pool.query(
        `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, 'active']
    );

    await pool.query(
        `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
        [vehicle_id]
    );

    const booking: IBookingWithDetails = result.rows[0];
    booking.vehicle = {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price
    };

    return booking;
};

export const getAllBookings = async (userId: number, userRole: string): Promise<IBookingWithDetails[]> => {
    let result;

    if (userRole === 'admin') {
        result = await pool.query(`
            SELECT 
                b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
                u.name as customer_name, u.email as customer_email,
                v.vehicle_name, v.registration_number
            FROM bookings b
            JOIN users u ON b.customer_id = u.id
            JOIN vehicles v ON b.vehicle_id = v.id
            ORDER BY b.id
        `);

        return result.rows.map(row => ({
            id: row.id,
            customer_id: row.customer_id,
            vehicle_id: row.vehicle_id,
            rent_start_date: row.rent_start_date,
            rent_end_date: row.rent_end_date,
            total_price: row.total_price,
            status: row.status,
            customer: {
                name: row.customer_name,
                email: row.customer_email
            },
            vehicle: {
                vehicle_name: row.vehicle_name,
                registration_number: row.registration_number
            }
        }));
    } else {
        result = await pool.query(`
            SELECT 
                b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
                v.vehicle_name, v.registration_number, v.type
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            WHERE b.customer_id = $1
            ORDER BY b.id
        `, [userId]);

        return result.rows.map(row => ({
            id: row.id,
            customer_id: userId,
            vehicle_id: row.vehicle_id,
            rent_start_date: row.rent_start_date,
            rent_end_date: row.rent_end_date,
            total_price: row.total_price,
            status: row.status,
            vehicle: {
                vehicle_name: row.vehicle_name,
                registration_number: row.registration_number,
                type: row.type
            }
        }));
    }
};

export const updateBooking = async (bookingId: number, userId: number, userRole: string, updateData: IUpdateBookingRequest): Promise<IBookingWithDetails> => {
    if (!bookingId || bookingId <= 0) {
        throw new Error("Invalid booking ID");
    }

    const bookingResult = await pool.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [bookingId]
    );

    if (bookingResult.rows.length === 0) {
        throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];
    const { status } = updateData;

    if (!status || !['cancelled', 'returned'].includes(status)) {
        throw new Error("Status must be 'cancelled' or 'returned'");
    }

    if (userRole === 'customer') {
        if (booking.customer_id !== userId) {
            throw new Error("Unauthorized: You can only update your own bookings");
        }

        if (status !== 'cancelled') {
            throw new Error("Customers can only cancel bookings");
        }

        if (booking.status !== 'active') {
            throw new Error("Only active bookings can be cancelled");
        }

        const startDate = new Date(booking.rent_start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate <= today) {
            throw new Error("Cannot cancel booking on or after start date");
        }

        await pool.query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
            [bookingId]
        );

        const otherActiveBookings = await pool.query(
            `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active' AND id != $2`,
            [booking.vehicle_id, bookingId]
        );


        if (otherActiveBookings.rows.length === 0) {
            await pool.query(
                `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
                [booking.vehicle_id]
            );
        }

        const result = await pool.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [bookingId]
        );

        return result.rows[0];
    }

    if (userRole === 'admin') {
        if (status === 'returned') {
            if (booking.status !== 'active') {
                throw new Error("Only active bookings can be marked as returned");
            }

            await pool.query(
                `UPDATE bookings SET status = 'returned' WHERE id = $1`,
                [bookingId]
            );


            const otherActiveBookings = await pool.query(
                `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active' AND id != $2`,
                [booking.vehicle_id, bookingId]
            );

            // Only set to available if no other active bookings
            if (otherActiveBookings.rows.length === 0) {
                await pool.query(
                    `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
                    [booking.vehicle_id]
                );
            }

            const result = await pool.query(
                `SELECT * FROM bookings WHERE id = $1`,
                [bookingId]
            );

            const vehicleResult = await pool.query(
                `SELECT availability_status FROM vehicles WHERE id = $1`,
                [booking.vehicle_id]
            );

            return {
                ...result.rows[0],
                vehicle: {
                    availability_status: vehicleResult.rows[0].availability_status
                }
            } as IBookingWithDetails;
        }
    }

    throw new Error("Invalid operation");
};