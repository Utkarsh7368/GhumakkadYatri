const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Package,PackageDetail} = require('../models/Package');
const helper = require('../functions/helper');
const { User, UserLoginHistory } = require('../models/User');
require('dotenv').config();

exports.getPackages = async (req, res) => {
    try {
        const packages = await Package.find({status: 1}).sort({ createdAt: -1 });
        res.status(200).json({ "status": 'success', "data": packages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
}

// Get package by ID
exports.getPackageById = async (req, res) => {
    const { packageId } = req.body;
    
    if (!packageId) {
        return res.status(400).json({ "status": 'failed', message: 'packageId is required' });
    }
    
    try {
        const package = await Package.findById(packageId);
        if (!package || package.status !== 1) {
            return res.status(404).json({ "status": 'failed', message: 'Package not found' });
        }
        res.status(200).json({ "status": 'success', "data": package });
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

exports.updatePackage = async (req, res) => {
    const { packageId, title, description, locations, price, duration, image_url } = req.body;
    const userId = await helper.getUserIdFromToken(req);
    if (!userId) {
        return res.status(400).json({ "status": 'failed', message: 'userId is required' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ "status": 'failed', message: 'Access denied, admin only' });
    }

    try {
        const updatedPackage = await Package.findByIdAndUpdate(packageId, { title, description, locations, price, duration, image_url, updatedAt: Date.now() }, { new: true });
        if (!updatedPackage) {
            return res.status(404).json({ "status": 'failed', message: 'Package not found' });
        }
        res.status(200).json({ "status": 'success', message: 'Package updated successfully', packageId: packageId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
}

exports.deletePackage = async (req, res) => {
    const { packageId } = req.body;
    const userId = await helper.getUserIdFromToken(req);
    if (!userId) {
        return res.status(400).json({ "status": 'failed', message: 'userId is required' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ "status": 'failed', message: 'Access denied, admin only' });
    }

    try {
        // Soft delete the package by setting status to 0
        const deletedPackage = await Package.findOneAndUpdate({ _id: packageId, status: 1 }, { status: 0 }, { new: true });
        if (!deletedPackage) {
            return res.status(404).json({ "status": 'failed', message: 'Package not found' });
        }
        
        // Also delete associated package details
        await PackageDetail.findOneAndDelete({ packageId });
        
        res.status(200).json({ 
            "status": 'success', 
            "data": deletedPackage, 
            message: 'Package and associated details deleted successfully', 
            packageId: packageId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
}

// Add package details
exports.addPackageDetails = async (req, res) => {
    const { packageId, details } = req.body;
    const userId = await helper.getUserIdFromToken(req);
    
    if (!userId) {
        return res.status(400).json({ "status": 'failed', message: 'userId is required' });
    }
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ "status": 'failed', message: 'Access denied, admin only' });
    }

    try {
        // Check if package exists
        const existingPackage = await Package.findById(packageId);
        if (!existingPackage) {
            return res.status(404).json({ "status": 'failed', message: 'Package not found' });
        }
        
        // Check if package details already exist
        const existingPackageDetails = await PackageDetail.findOne({ packageId });
        if (existingPackageDetails) {
            return res.status(400).json({ "status": 'failed', message: 'Package details already exist. Use update instead.' });
        }
        
        const newPackageDetails = new PackageDetail({ 
            packageId,
            details: details,  // Nest the details under the 'details' field
            createdBy: userId,
            createdAt: new Date(),
            status: 1
        });
        
        await newPackageDetails.save();
        
        // Convert to object and remove _id from nested arrays
        const detailsObj = newPackageDetails.toObject();
        
        // Clean the nested details object
        if (detailsObj.details) {
            // Remove _id from gallery items
            if (detailsObj.details.gallery && Array.isArray(detailsObj.details.gallery)) {
                detailsObj.details.gallery = detailsObj.details.gallery.map(item => {
                    const { _id, ...galleryItem } = item;
                    return galleryItem;
                });
            }
            
            // Remove _id from itinerary items
            if (detailsObj.details.itinerary && Array.isArray(detailsObj.details.itinerary)) {
                detailsObj.details.itinerary = detailsObj.details.itinerary.map(item => {
                    const { _id, ...itineraryItem } = item;
                    return itineraryItem;
                });
            }
            
            // Remove _id from reviews
            if (detailsObj.details.reviews && Array.isArray(detailsObj.details.reviews)) {
                detailsObj.details.reviews = detailsObj.details.reviews.map(item => {
                    const { _id, ...reviewItem } = item;
                    return reviewItem;
                });
            }
        }
        
        res.status(200).json({ 
            "status": 'success', 
            message: 'Package details added successfully',
            "data": detailsObj 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
};

// Update package details
exports.updatePackageDetails = async (req, res) => {
    const { packageId, details } = req.body;
    const userId = await helper.getUserIdFromToken(req);
    
    if (!userId) {
        return res.status(400).json({ "status": 'failed', message: 'userId is required' });
    }
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ "status": 'failed', message: 'Access denied, admin only' });
    }

    try {
        console.log('Update request received:');
        console.log('PackageId:', packageId);
        console.log('Details to update:', JSON.stringify(details, null, 2));
        
        // Check if package details exist
        const existingPackageDetails = await PackageDetail.findOne({ packageId });
        if (!existingPackageDetails) {
            return res.status(404).json({ "status": 'failed', message: 'Package details not found' });
        }
        
        console.log('Existing details before update:', JSON.stringify(existingPackageDetails.details, null, 2));
        
        const updatedPackageDetails = await PackageDetail.findOneAndUpdate(
            { packageId },
            { 
                details: details,  // Nest the details under the 'details' field
                updated_at: new Date()
            },
            { new: true }
        );
        
        console.log('Updated details after save:', JSON.stringify(updatedPackageDetails.details, null, 2));
        
        // Convert to object and remove _id from nested arrays
        const detailsObj = updatedPackageDetails.toObject();
        
        // Clean the nested details object
        if (detailsObj.details) {
            // Remove _id from gallery items
            if (detailsObj.details.gallery && Array.isArray(detailsObj.details.gallery)) {
                detailsObj.details.gallery = detailsObj.details.gallery.map(item => {
                    const { _id, ...galleryItem } = item;
                    return galleryItem;
                });
            }
            
            // Remove _id from itinerary items
            if (detailsObj.details.itinerary && Array.isArray(detailsObj.details.itinerary)) {
                detailsObj.details.itinerary = detailsObj.details.itinerary.map(item => {
                    const { _id, ...itineraryItem } = item;
                    return itineraryItem;
                });
            }
            
            // Remove _id from reviews
            if (detailsObj.details.reviews && Array.isArray(detailsObj.details.reviews)) {
                detailsObj.details.reviews = detailsObj.details.reviews.map(item => {
                    const { _id, ...reviewItem } = item;
                    return reviewItem;
                });
            }
        }
        
        res.status(200).json({ 
            "status": 'success', 
            message: 'Package details updated successfully',
            "data": detailsObj 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
};


// Get package details by packageId
exports.getPackageDetails = async (req, res) => {
    const { packageId } = req.body;
    
    if (!packageId) {
        return res.status(400).json({ "status": 'failed', message: 'packageId is required' });
    }
    
    try {
        const packageDetails = await PackageDetail.findOne({ packageId });
        if (!packageDetails) {
            return res.status(404).json({ "status": 'failed', message: 'Package details not found' });
        }
        
        // Convert to object and remove _id from nested arrays
        const detailsObj = packageDetails.toObject();
        
        // Clean the nested details object
        if (detailsObj.details) {
            // Remove _id from gallery items
            if (detailsObj.details.gallery && Array.isArray(detailsObj.details.gallery)) {
                detailsObj.details.gallery = detailsObj.details.gallery.map(item => {
                    const { _id, ...galleryItem } = item;
                    return galleryItem;
                });
            }
            
            // Remove _id from itinerary items
            if (detailsObj.details.itinerary && Array.isArray(detailsObj.details.itinerary)) {
                detailsObj.details.itinerary = detailsObj.details.itinerary.map(item => {
                    const { _id, ...itineraryItem } = item;
                    return itineraryItem;
                });
            }
            
            // Remove _id from reviews
            if (detailsObj.details.reviews && Array.isArray(detailsObj.details.reviews)) {
                detailsObj.details.reviews = detailsObj.details.reviews.map(item => {
                    const { _id, ...reviewItem } = item;
                    return reviewItem;
                });
            }
        }
        
        res.status(200).json({ "status": 'success', "data": detailsObj });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
};

// Delete package details
exports.deletePackageDetails = async (req, res) => {
    const { packageId } = req.body;
    const userId = await helper.getUserIdFromToken(req);
    
    if (!userId) {
        return res.status(400).json({ "status": 'failed', message: 'userId is required' });
    }
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ "status": 'failed', message: 'Access denied, admin only' });
    }

    try {
        const deletedPackageDetail = await PackageDetail.findOneAndDelete({ packageId });
        
        if (!deletedPackageDetail) {
            return res.status(404).json({ "status": 'failed', message: 'Package details not found' });
        }
        
        res.status(200).json({ 
            "status": 'success', 
            message: 'Package details deleted successfully',
            packageId: packageId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": 'failed', message: 'Server error' });
    }
};

