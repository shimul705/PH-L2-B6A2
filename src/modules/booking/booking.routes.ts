import { Router } from "express";
import { createBookingController, getAllBookingsController, updateBookingController } from "./booking.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post('/', authMiddleware, createBookingController);
router.get('/', authMiddleware, getAllBookingsController);
router.put('/:bookingId', authMiddleware, updateBookingController);

export const bookingRoute = router;