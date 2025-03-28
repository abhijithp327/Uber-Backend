import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface UserPayload extends JwtPayload {
    userId: string,
    usr_role: string;
}

interface AuthRequest extends Request {
    user?: UserPayload;
}


export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {

    // Check for the token in cookies
    const token = req.cookies?.token;
    // console.log('token:', token);

    if (!token) {
        res.status(401).json({ status: 401, auth: false, success: false, failed: true, message: "Authentication failed. Token not found" });
    } else {
        console.log();
        jwt.verify(token, process.env.JWT_ACCESS as string, (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Token expired. Please log in again." });
                }
                res.status(401).json({ status: 401, auth: false, success: false, failed: true, message: "Invalid token" });
            } else {
                req.user = decoded as UserPayload;
                next();
            }
        });
    }

};






