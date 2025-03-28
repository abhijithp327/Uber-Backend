import express from "express";
import { createCaptain, getCaptainProfile, loginCaptain, logoutCaptain } from "../controllers/captain.controller";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();


router.post("/create", createCaptain);
router.post("/login", loginCaptain);
router.get("/profile", verifyToken, getCaptainProfile);
router.post("/logout", logoutCaptain);


export default router;