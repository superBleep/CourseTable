import mongoose from "mongoose";

const blacklistedTokensSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
});

export const blacklistedTokensModel = mongoose.model('blacklistedToken', blacklistedTokensSchema);