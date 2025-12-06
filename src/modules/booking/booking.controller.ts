import { Request, Response, NextFunction } from "express";
import { createBooking, getAllBookings, updateBooking } from "./booking.service";

export const createBookingController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = (req as any).user;
        const { customer_id } = req.body;


        if (!customer_id) {
            res.status(400).json({
                success: false,
                message: "customer_id is required",
                errors: "customer_id is required"
            });
            return;
        }


        if (currentUser.role === 'customer') {
            if (customer_id !== currentUser.id) {
                res.status(403).json({
                    success: false,
                    message: "Forbidden: You can only create bookings for yourself",
                    errors: "Forbidden: You can only create bookings for yourself"
                });
                return;
            }
        }


        const booking = await createBooking(req.body);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create booking",
            errors: error.message
        });
    }
};

export const getAllBookingsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = (req as any).user;
        const bookings = await getAllBookings(currentUser.id, currentUser.role);

        const message = currentUser.role === 'admin'
            ? "Bookings retrieved successfully"
            : "Your bookings retrieved successfully";

        res.status(200).json({
            success: true,
            message: message,
            data: bookings
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve bookings",
            errors: error.message
        });
    }
};

export const updateBookingController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingIdParam = req.params.bookingId;
        if (!bookingIdParam) {
            res.status(400).json({
                success: false,
                message: "bookingId parameter is required",
                errors: "bookingId parameter is required"
            });
            return;
        }
        const bookingId = parseInt(bookingIdParam, 10);
        if (Number.isNaN(bookingId)) {
            res.status(400).json({
                success: false,
                message: "bookingId must be a valid integer",
                errors: "bookingId must be a valid integer"
            });
            return;
        }
        const currentUser = (req as any).user;

        const booking = await updateBooking(bookingId, currentUser.id, currentUser.role, req.body);

        const message = req.body.status === 'cancelled'
            ? "Booking cancelled successfully"
            : "Booking marked as returned. Vehicle is now available";

        res.status(200).json({
            success: true,
            message: message,
            data: booking
        });
    } catch (error: any) {
        const statusCode = error.message === "Booking not found" ? 404 :
            error.message.includes("Unauthorized") ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update booking",
            errors: error.message
        });
    }
};