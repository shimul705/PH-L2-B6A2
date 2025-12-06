import { Request, Response, NextFunction } from "express";
import { getAllUsers, updateUser, deleteUser } from "./user.service";

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to retrieve users",
            errors: error.message
        });
    }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdParam = req.params.userId;
        if (!userIdParam) {
            res.status(400).json({
                success: false,
                message: "userId parameter is required",
                errors: "userId parameter is required"
            });
            return;
        }
        const userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid userId",
                errors: "Invalid userId"
            });
            return;
        }

        const currentUser = (req as any).user;

        if (currentUser.role !== 'admin' && currentUser.id !== userId) {
            res.status(403).json({
                success: false,
                message: "Forbidden: You can only update your own profile",
                errors: "Forbidden: You can only update your own profile"
            });
            return;
        }

        const user = await updateUser(userId, req.body);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (error: any) {
        const statusCode = error.message === "User not found" ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update user",
            errors: error.message
        });
    }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdParam = req.params.userId;
        if (!userIdParam) {
            res.status(400).json({
                success: false,
                message: "userId parameter is required",
                errors: "userId parameter is required"
            });
            return;
        }
        const userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid userId",
                errors: "Invalid userId"
            });
            return;
        }

        await deleteUser(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error: any) {
        const statusCode = error.message === "User not found" ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to delete user",
            errors: error.message
        });
    }
};