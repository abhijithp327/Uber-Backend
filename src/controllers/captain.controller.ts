import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import Joi from "joi";
import bcrypt from "bcrypt";
import Captain from "../models/captain.model";
import { generateAccessToken } from "../utils/token";


interface UserPayload extends JwtPayload {
    userId: string | ObjectId;
}

interface AuthRequest extends Request {
    user?: UserPayload;
}



export const createCaptain = async (req: Request, res: Response) => {

    try {

        const { fullname, email, password, vehicle } = req.body;

        // ✅ Fixed fullname validation
        const schema = Joi.object({
            fullname: Joi.object({
                firstname: Joi.string().min(3).required().label("First Name"),
                lastname: Joi.string().min(3).optional().label("Last Name"),
            }).required().label("Full Name"),

            email: Joi.string().email().required().label("Email"),
            password: Joi.string().min(6).required().label("Password"),
            vehicle: Joi.object({
                color: Joi.string().min(3).required().label("Vehicle Color"),
                plate: Joi.string().min(3).required().label("Vehicle Plate"),
                capacity: Joi.number().min(1).required().label("Vehicle Capacity"),
                vehicleType: Joi.string().valid("car", "motorcycle", "auto").required().label("Vehicle Type"),
            }).required().label("Vehicle"),
        });

        // ✅ Perform validation
        const { error } = schema.validate({ fullname, email, password, vehicle }, { abortEarly: false });

        if (error) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Validation Error",
                errors: error.details.map(err => err.message),  // ✅ Fixed error handling
            });
            return;
        }

        const isUserAlready = await Captain.findOne({ email });

        if (isUserAlready) {
            res.status(400).json({ message: 'User already exist' })
            return;
        };

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await Captain.create({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            },
            email,
            password: hashPassword,
            vehicle
        });

        const token = generateAccessToken({
            ...newUser.toObject(),
            userId: newUser._id.toString()
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 10 // 10 days
        });

        res.status(201).json({
            status: 200,
            success: true,
            message: "Captain created successfully",
            result: {
                newUser,
                token
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to create user",
            error: error
        });
    }
};


export const loginCaptain = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;

        const schema = Joi.object({
            email: Joi.string().email().required().label("Email"),
            password: Joi.string().min(3).required().label("Password"),
        });

        // ✅ Perform validation
        const { error } = schema.validate({ email, password }, { abortEarly: false });

        if (error) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Validation Error",
                errors: error.details.map(err => err.message),  // ✅ Fixed error handling
            });
            return;
        }

        const user = await Captain.findOne({ email }).select('+password');

        if (!user) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        };

        const token = generateAccessToken({
            ...user.toObject(),
            userId: user._id.toString()
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 10 // 10 days
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Captain logged in successfully",
            result: {
                userId: user._id.toString(),
                fullname: user.fullname,
                email: user.email,
                token
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to login user",
            error: error
        });
    }
};



export const getCaptainProfile = async (req: AuthRequest, res: Response) => {
    try {

        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({ message: 'User not found' });
            return;
        };

        const user = await Captain.findById(userId);

        if (!user) {
            res.status(400).json({ message: 'Captain not found' });
            return;
        };

        res.status(200).json({
            status: 200,
            success: true,
            message: "Captain details fetched successfully",
            result: user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch captain details",
            error: error
        });
    }
};


export const logoutCaptain = async (req: Request, res: Response) => {
    try {

        // const token = req.cookies.token;

        // await BlacklistToken.create({ token });

        // Clear cookies by setting them to empty with immediate expiry
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Immediately expire the cookie
            path: "/",
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Logout successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to logout",
            error: error,
        });
    }
}; 
