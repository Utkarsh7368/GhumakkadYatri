const express = require('express');
const router=express.Router();
const adminRoute=require('../controller/adminController');
const { authenticateToken } = require('../middleware/validateToken');

// Public routes (no authentication required)
router.post('/getPackages',authenticateToken, adminRoute.getPackages);
router.post('/getPackageById',authenticateToken, adminRoute.getPackageById);
router.post('/getPackageDetails',authenticateToken, adminRoute.getPackageDetails);



module.exports = router;