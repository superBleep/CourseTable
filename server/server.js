import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router as authRoutes } from './routes/authRoutes.js';
import timestamped from './utils/timestamp.js';

dotenv.config();

mongoose.connect(process.env.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
    console.log(timestamped('Connected to MongoDB'))
});

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(timestamped(`Server started on port ${PORT}`));
});