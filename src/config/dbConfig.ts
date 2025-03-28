import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async (): Promise<void> => {
    try {
        const mongoUri: string = process.env.MONGO_URI as string;
        await mongoose.connect(mongoUri);
    } catch (error) {
        console.log(error);
    }
}

export default connectDb;