const axios = require('axios');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const  {User,UserLoginHistory}  = require('../models/User');
require('dotenv').config();

async function authenticateToken(req, res, next) {
   try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization Header Missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied, Token Missing' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // mark token as expired in DB
            await UserLoginHistory.updateOne({ token }, { status: 0 });
            return res.status(401).json({ message: 'Token Expired' });
        }
        return res.status(401).json({ message: 'Invalid Token' });
    }

    const userId = decoded.id;

    if (userId) {
        const loggedInUser = await UserLoginHistory.findOne({ token, status: 1 });
        if (!loggedInUser) {
            return res.status(401).json({ message: 'Invalid Token' });
        }
    }

    next();

} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
}

}

module.exports = { authenticateToken };