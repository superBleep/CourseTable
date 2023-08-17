import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';

export const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const validateEmail = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(req.body.email);
        if(!validateEmail)
            throw new Error('Invalid email');

        const userExists = await userModel.exists({
            email: req.body.email
        });
        if(userExists)
            throw new Error('User already exists');

        await userModel.create({ 
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        res.json({
            mess: 'Signup successful'
        });
    } catch (e) {
        // console.error(e);
        if(e.message == 'Invalid email' || e.message == 'User already exists')
            res.status(400).json({
                mess: e.message
            });
        else
            res.json({
                mess: e.message
            });
    }
});

router.post('/login', async(req, res) => {
    try {
        let user = await userModel.findOne({
            email: req.body.login_user
        });

        if(!user) {
            user = await userModel.findOne({
                username: req.body.login_user
            });
        }
            
        if(!user)
            throw new Error('User not found');

        const validPassword = bcrypt.compare(req.body.password, user.password);
        if(!validPassword)
            throw new Error('Invalid password');

        const accessToken = jwt.sign(user.toJSON(), process.env.JWT_ACC_SECRET, { expiresIn: '10m' });

        res.json({
            token: accessToken,
            mess: 'Login successful'
        });
    } catch (e) {
        // console.error(e);
        if(e.message == 'User not found' || e.message == 'Invalid password')
            res.status(404).json({
                mess: e.message
            });
        else
            res.json({
                mess: e.message
            });
    }
});

router.post('/validate', async (req, res) => {
    try {
        jwt.verify(req.body.token, process.env.JWT_ACC_SECRET);

        res.status(200).json({
            mess: "Token validated"
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({
            mess: e.message
        });
    }
});