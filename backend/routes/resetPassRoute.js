const express = require('express');
const router = express.Router();
const passwordResetController = require('../controller/passwordResetController');
const {authenticateToken} = require('../middleware/validateToken');

// POST /api/auth/forgotPassword
router.post('/forgotPassword', passwordResetController.forgotPassword);

// GET /api/auth/verifyResetToken/:token
router.get('/verifyResetToken/:token', passwordResetController.verifyResetToken);

// POST /api/auth/resetPassword/:token
router.post('/resetPassword/:token', passwordResetController.resetPassword);

module.exports = router;