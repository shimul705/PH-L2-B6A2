import { Request, Response, NextFunction } from "express";
import { createUser, loginUser } from "./auth.service";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to register user",
            errors: error.message
        });
    }
};

export const signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message || "Login failed",
            errors: error.message
        });
    }
};