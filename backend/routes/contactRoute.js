const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');

// POST /api/common/contact
router.post('/contact', contactController.submitContactForm);

// GET /api/common/contact-info
router.get('/contactInfo', contactController.getContactInfo);

module.exports = router;