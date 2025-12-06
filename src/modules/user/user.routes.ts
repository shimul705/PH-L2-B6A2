import { Router } from "express";
import { getAllUsersController, updateUserController, deleteUserController } from "./user.controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get('/', authMiddleware, adminMiddleware, getAllUsersController);
router.put('/:userId', authMiddleware, updateUserController);
router.delete('/:userId', authMiddleware, adminMiddleware, deleteUserController);

export const userRoute = router;