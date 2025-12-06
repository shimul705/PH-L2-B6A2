import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../database/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
                errors: "Unauthorized: No token provided"
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
                errors: "Unauthorized: No token provided"
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const result = await pool.query(
            `SELECT id, email, role FROM users WHERE id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
                errors: "Unauthorized: User not found"
            });
            return;
        }

        const currentUser = result.rows[0];


        (req as any).user = {
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role
        };

        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token",
            errors: "Unauthorized: Invalid token"
        });
    }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;

        if (!user || user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required",
                errors: "Forbidden: Admin access required"
            });
            return;
        }

        next();
    } catch (error: any) {
        res.status(403).json({
            success: false,
            message: "Forbidden: Admin access required",
            errors: "Forbidden: Admin access required"
        });
    }
};