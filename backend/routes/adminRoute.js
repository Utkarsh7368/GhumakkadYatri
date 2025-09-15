const express = require('express');
const router=express.Router();
const adminRoute=require('../controller/adminController');
const { authenticateToken } = require('../middleware/validateToken');

router.post('/getPackages', authenticateToken, adminRoute.getPackages);
router.post('/createPackage', authenticateToken, adminRoute.createPackage);

module.exports = router;
