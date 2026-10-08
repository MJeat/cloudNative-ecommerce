import express from "express";
import User from "../models/User.js";
import {
  authLogin,
  authRegister,
  refresh,
  getCurrentUser,
  authLogout,
  updateUserById,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", authRegister);
authRouter.post("/login", authLogin);
authRouter.post("/refresh", refresh);
authRouter.get("/me", verifyToken, getCurrentUser);
authRouter.patch("/me", verifyToken, updateUserById);
authRouter.post("/logout", verifyToken, authLogout);

export default authRouter;
