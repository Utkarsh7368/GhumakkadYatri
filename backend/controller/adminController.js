const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Package = require('../models/Package');
const helper = require('../functions/helper');
const { User, UserLoginHistory } = require('../models/User');
require('dotenv').config();

exports.getPackages = async (req, res) => {
    try {
        const packages = await Package.find({}).sort({ createdAt: -1 });
        res.status(200).json({ "status": 'success', "data": packages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
}

exports.createPackage = async (req, res) => {
    const { title, description, locations, price, duration, image_url } = req.body;
    const userId = await helper.getUserIdFromToken(req);
    if (!userId) {
        return res.status(400).json({ "status": 'failed', message: 'userId is required' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ "status": 'failed', message: 'Access denied, admin only' });
    }

    try {
        const newPackage = new Package({ title, description, locations, price, duration, image_url, createdBy: userId, createdAt: Date.now(), status: 1 });
        await newPackage.save();
        res.status(201).json({ "status": 'success', "data": newPackage, message: 'Package created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
}