import express, { Request, Response } from 'express';
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDb from './config/dbConfig';

// Routes
import userRoutes from './routes/user.route';
import captainRoutes from './routes/captain.route';


dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/captain', captainRoutes);


app.get('/', (req: Request, res: Response) => {
    res.json('Uber Clone server is running... ✅🚀');
});

connectDb().then(() => {
    app.listen(port, () => {
        console.log('✅ Database connected successfully 🚀');
        console.log(`🔴 Server is running http://localhost:${port}`);
    });
});
