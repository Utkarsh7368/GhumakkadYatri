const express = require('express');
const router=express.Router();
const authRoute=require('../controller/loginController');
const { authenticateToken } = require('../middleware/validateToken');

router.post('/login',authRoute.login);
router.post('/register',authRoute.register);
router.post('/logout',authenticateToken,authRoute.logout);
module.exports = router;