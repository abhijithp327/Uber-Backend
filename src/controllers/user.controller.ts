import { Request, response, Response } from "express";
import { ObjectId } from "mongoose";
import Joi from "joi";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { generateAccessToken } from "../utils/token";
import BlacklistToken from "../models/blachlistToken.model";



interface UserPayload extends JwtPayload {
    userId: string | ObjectId;
}

interface AuthRequest extends Request {
    user?: UserPayload;
}



export const registerUser = async (req: Request, res: Response) => {

    try {

        const { fullname, email, password } = req.body;

        // ✅ Fixed fullname validation
        const schema = Joi.object({
            fullname: Joi.object({
                firstname: Joi.string().min(3).required().label("First Name"),
                lastname: Joi.string().min(3).optional().label("Last Name"),
            }).required().label("Full Name"),

            email: Joi.string().email().required().label("Email"),
            password: Joi.string().min(6).required().label("Password"),
        });

        // ✅ Perform validation
        const { error } = schema.validate({ fullname, email, password }, { abortEarly: false });

        if (error) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Validation Error",
                errors: error.details.map(err => err.message),  // ✅ Fixed error handling
            });
            return;
        }

        const isUserAlready = await User.findOne({ email });

        if (isUserAlready) {
            res.status(400).json({ message: 'User already exist' })
            return;
        };

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            },
            email,
            password: hashPassword
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
            message: "User created successfully",
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


export const loginUser = async (req: Request, res: Response) => {
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

        const user = await User.findOne({ email }).select('+password');

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
            message: "User logged in successfully",
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


export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {

        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({ message: 'User not found' });
            return;
        };

        const user = await User.findById(userId);

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        };

        res.status(200).json({
            status: 200,
            success: true,
            message: "User details fetched successfully",
            result: user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch user details",
            error: error
        });
    }
};


export const logoutUser = async (req: Request, res: Response) => {
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
