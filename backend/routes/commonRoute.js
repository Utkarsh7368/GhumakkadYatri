const express = require('express');
const router=express.Router();
const adminRoute=require('../controller/adminController');
const { authenticateToken } = require('../middleware/validateToken');

// Public routes (no authentication required)
router.post('/getPackages', adminRoute.getPackages);
router.post('/getPackageById', adminRoute.getPackageById);
router.post('/getPackageDetails', adminRoute.getPackageDetails);



module.exports = router;