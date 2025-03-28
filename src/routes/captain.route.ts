import express from "express";
import { createCaptain } from "../controllers/captain.controller";


const router = express.Router();


router.post("/create", createCaptain);



export default router;