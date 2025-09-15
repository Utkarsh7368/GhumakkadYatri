const express = require('express'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserLoginHistory } = require('../models/User');
require('dotenv').config();

async function getUserIdFromToken(req) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization Header Missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access Denied, Token Missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        return userId;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

module.exports = { getUserIdFromToken };