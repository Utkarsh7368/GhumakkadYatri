const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserLoginHistory } = require('../models/User');
const helper = require('../functions/helper');
require('dotenv').config();

async function generateToken(user) {
    return jwt.sign({ id: user._id, password: user.password }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const existLoginRecord= await UserLoginHistory.findOne({userId:user._id, status:1});
        if(existLoginRecord){
            return res.status(200).json({token:existLoginRecord.token, message: 'User already logged in' });
        }
        const token = await generateToken(user);
        const loginRecord = new UserLoginHistory({ userId: user._id, token, loginTime: Date.now(), status: 1 });
        await loginRecord.save();
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role }, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role: 'user' });
        await newUser.save();

        const token = await generateToken(newUser);
        res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }, message: 'Registration successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.logout = async (req, res) => {
    try {
        const userId = await helper.getUserIdFromToken(req);
        if (userId) {
            const loggedInUser = await UserLoginHistory.findOne({ userId: userId, status: 1 });
            if (!loggedInUser) {
                return res.status(401).json({ message: 'Already logged out' });
            }
            else{
                loggedInUser.status = 0;
                await loggedInUser.save();
                return res.status(200).json({ message: 'Logout successful' });
            }
        }
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}