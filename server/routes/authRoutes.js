import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import { userModel } from '../models/userModel.js';
import { refreshTokensModel } from '../models/refreshTokensModel.js';
import { blacklistedTokensModel } from '../models/blacklistedTokensModel.js';
import ms from 'ms';

export const router = express.Router();

// req.body -> email, username. password
router.post('/signup', async (req, res) => {
    try {
        const validateEmail = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(req.body.email);
        if(!validateEmail)
            throw new Error('Invalid email');

        const userExists = await userModel.exists({email: req.body.email});
        if(userExists)
            throw new Error('User already exists');

        await userModel.create({ 
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        res.json({mess: 'Signup successful'});
    } catch (e) {
        // console.error(e);
        if(e.message == 'Invalid email' || e.message == 'User already exists')
            res.status(400).json({error: e});
        else
            res.json({error: e});
    }
});


// req.body -> username/email, password
router.post('/login', async(req, res) => {
    try {
        let user = await userModel.findOne({email: req.body.login_user});

        if(!user)
            user = await userModel.findOne({username: req.body.login_user});
            
        if(!user)
            throw new Error('User not found');

        const validPassword = bcrypt.compare(req.body.password, user.password);
        if(!validPassword)
            throw new Error('Invalid password');

        // Generate access and refresh tokens for the user
        // access token --> localStorage
        // refresh token --> mongoDB 
        const payload = {
            userData: user.toJSON(),
            salt: crypto.randomBytes(16).toString('hex')
        }
        const accessToken = jwt.sign(payload, process.env.JWT_ACC_SECRET, { expiresIn: process.env.JWT_ACC_TOKEN_EXP });

        if(!(await refreshTokensModel.findOne({username: user.username}))) {
            await refreshTokensModel.create({
                token: crypto.randomBytes(32).toString('hex'),
                username: user.username,
                expiresAt: Date.now() + ms(process.env.JWT_RFRSH_TOKEN_EXP)
            });
        }

        res.json({
            token: accessToken,
            mess: 'Login successful'
        });
    } catch (e) {
        //console.error(e);
        if(e.message == 'User not found' || e.message == 'Invalid password')
            res.status(404).json({error: e});
        else
            res.json({error: e});
    }
});

function regenerateToken(oldToken) {
    // Repack the access token payload with the new issue date
    const userData = jwt_decode(oldToken).userData;
    const payload = {
        userData: userData,
        salt: crypto.randomBytes(16).toString('hex')
    }
    const accessToken = jwt.sign(payload, process.env.JWT_ACC_SECRET, { expiresIn: process.env.JWT_ACC_TOKEN_EXP });

    return accessToken;
}

// req.body -> token
router.post('/validate', async (req, res) => {
    try {
        jwt.verify(req.body.token, process.env.JWT_ACC_SECRET)

        res.status(200).json({mess: "Token validated"});
    } catch (e) {
        //console.error(e);
        let toSend = {error: e};

        // Access token expired
        if(e.name == 'TokenExpiredError') {
            const username = jwt_decode(req.body.token).userData.username;
            const refreshToken = await refreshTokensModel.findOne({username: username});
            await blacklistedTokensModel.create({token: refreshToken.token});

            // Refresh token expired; user has to login again
            if(refreshToken.expiresAt <= Date.now()) {
                await refreshTokensModel.findOneAndRemove(refreshToken);
            }
            // Refresh token still valid; silent login
            else {
                const accessToken = regenerateToken(req.body.token);
                await refreshTokensModel.findOneAndReplace(refreshToken, {
                    token: crypto.randomBytes(32).toString('hex'),
                    username: username,
                    expiresAt: Date.now() + ms(process.env.JWT_RFRSH_TOKEN_EXP)
                });

                toSend = {
                    token: accessToken,
                    mess: 'Token revalidated'
                }
            }
        }

        if(toSend.error)
            res.status(400).json(toSend);
        else
            res.json(toSend);
    }
});