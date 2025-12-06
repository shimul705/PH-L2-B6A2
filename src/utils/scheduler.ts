

import { pool } from "../database/db";


export const autoReturnExpiredBookings = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);


        const expiredBookings = await pool.query(
            `SELECT id, vehicle_id FROM bookings 
             WHERE status = 'active' AND rent_end_date < $1`,
            [today]
        );

        if (expiredBookings.rows.length === 0) {
            return;
        }


        for (const booking of expiredBookings.rows) {

            await pool.query(
                `UPDATE bookings SET status = 'returned' WHERE id = $1`,
                [booking.id]
            );


            const otherActiveBookings = await pool.query(
                `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
                [booking.vehicle_id]
            );


            if (otherActiveBookings.rows.length === 0) {
                await pool.query(
                    `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
                    [booking.vehicle_id]
                );
            }
        }
    } catch (error) {

        console.error("Error in auto-return scheduler:", error);
    }
};


export const startScheduler = () => {

    autoReturnExpiredBookings();


    setInterval(() => {
        autoReturnExpiredBookings();
    }, 3600000);





};