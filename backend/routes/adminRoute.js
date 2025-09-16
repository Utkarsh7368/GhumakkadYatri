const express = require('express');
const router=express.Router();
const adminRoute=require('../controller/adminController');
const { authenticateToken } = require('../middleware/validateToken');


router.post('/createPackage', authenticateToken, adminRoute.createPackage);
router.post('/updatePackage', authenticateToken, adminRoute.updatePackage);
router.post('/deletePackage', authenticateToken, adminRoute.deletePackage);
router.post('/addPackageDetails', authenticateToken, adminRoute.addPackageDetails);
router.post('/updatePackageDetails', authenticateToken, adminRoute.updatePackageDetails);
router.post('/deletePackageDetails', authenticateToken, adminRoute.deletePackageDetails);

module.exports = router;
