const axios = require('axios');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const  {User,UserLoginHistory}  = require('../models/User');
require('dotenv').config();

async function authenticateToken(req, res, next) {
    try{
        const authHeader =req.headers['authorization'];
        if(!authHeader){
            return res.status(401).json({ message: 'Authorization Header Missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access Denied, Token Missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const expiryTime = decoded.exp;
        if(userId){
            const loggedInUser= await UserLoginHistory.findOne({token:token, status: 1 });
            if(!loggedInUser){
                return res.status(401).json({ message: 'Invalid Token' });
            }
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime > expiryTime) {
                loggedInUser.status=0;
                await loggedInUser.save();
                return res.status(401).json({ message: 'Token Expired' });
            }
            
        }
        next();
    }catch(error){
        console.error('Token validation error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = { authenticateToken };