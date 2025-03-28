import express from "express";
import { validationResult } from "express-validator";
import { getUserProfile, loginUser, logoutUser, registerUser } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUserProfile);
router.post("/logout", logoutUser);


export default router;