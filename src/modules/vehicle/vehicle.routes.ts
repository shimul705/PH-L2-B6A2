import { Router } from "express";
import { createVehicleController, getAllVehiclesController, getVehicleByIdController, updateVehicleController, deleteVehicleController } from "./vehicle.controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post('/', authMiddleware, adminMiddleware, createVehicleController);
router.get('/', getAllVehiclesController);
router.get('/:vehicleId', getVehicleByIdController);
router.put('/:vehicleId', authMiddleware, adminMiddleware, updateVehicleController);
router.delete('/:vehicleId', authMiddleware, adminMiddleware, deleteVehicleController);

export const vehicleRoute = router;