import { Request, Response, NextFunction } from "express";
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from "./vehicle.service";

export const createVehicleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicle = await createVehicle(req.body);
        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create vehicle",
            errors: error.message
        });
    }
};

export const getAllVehiclesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicles = await getAllVehicles();
        if (vehicles.length === 0) {
            res.status(200).json({
                success: true,
                message: "No vehicles found",
                data: []
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: vehicles
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve vehicles",
            errors: error.message
        });
    }
};

export const getVehicleByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicleIdParam = req.params.vehicleId;
        if (!vehicleIdParam) {
            res.status(400).json({
                success: false,
                message: "vehicleId parameter is required",
                errors: "vehicleId parameter is required"
            });
            return;
        }
        const vehicleId = parseInt(vehicleIdParam, 10);
        if (isNaN(vehicleId)) {
            res.status(400).json({
                success: false,
                message: "Invalid vehicleId",
                errors: "Invalid vehicleId"
            });
            return;
        }

        const vehicle = await getVehicleById(vehicleId);

        if (!vehicle) {
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
                errors: "Vehicle not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: vehicle
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve vehicle",
            errors: error.message
        });
    }
};

export const updateVehicleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicleIdParam = req.params.vehicleId;
        if (!vehicleIdParam) {
            res.status(400).json({
                success: false,
                message: "vehicleId parameter is required",
                errors: "vehicleId parameter is required"
            });
            return;
        }
        const vehicleId = parseInt(vehicleIdParam, 10);
        if (isNaN(vehicleId)) {
            res.status(400).json({
                success: false,
                message: "Invalid vehicleId",
                errors: "Invalid vehicleId"
            });
            return;
        }

        const vehicle = await updateVehicle(vehicleId, req.body);

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: vehicle
        });
    } catch (error: any) {
        const statusCode = error.message === "Vehicle not found" ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update vehicle",
            errors: error.message
        });
    }
};

export const deleteVehicleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicleIdParam = req.params.vehicleId;
        if (!vehicleIdParam) {
            res.status(400).json({
                success: false,
                message: "vehicleId parameter is required",
                errors: "vehicleId parameter is required"
            });
            return;
        }
        const vehicleId = parseInt(vehicleIdParam, 10);
        if (isNaN(vehicleId)) {
            res.status(400).json({
                success: false,
                message: "Invalid vehicleId",
                errors: "Invalid vehicleId"
            });
            return;
        }

        await deleteVehicle(vehicleId);

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });
    } catch (error: any) {
        const statusCode = error.message === "Vehicle not found" ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to delete vehicle",
            errors: error.message
        });
    }
};