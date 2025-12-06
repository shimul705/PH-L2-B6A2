import express, { Request, Response } from 'express';
import { initDB } from './database/db';
import { startScheduler } from './utils/scheduler';
import { authRoute } from './modules/auth/auth.routes';
import { vehicleRoute } from './modules/vehicle/vehicle.routes';
import { userRoute } from './modules/user/user.routes';
import { bookingRoute } from './modules/booking/booking.routes';

const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/vehicles', vehicleRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/bookings', bookingRoute);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Server is running Successfully',
        path: req.path
    });
});

const startServer = async () => {
    try {
        await initDB();

        startScheduler();

        app.listen(5000, () => {
            console.log("Server Is Running on port 5000");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();