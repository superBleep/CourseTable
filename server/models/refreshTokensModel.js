import ms from 'ms'
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const refreshTokensSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: String,
        required: true
    }
});

export const refreshTokensModel = mongoose.model('refreshToken', refreshTokensSchema);