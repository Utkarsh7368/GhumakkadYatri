const express = require('express');
const { sendContactFormEmail } = require('../functions/emailService');

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
    try {
        const { name, firstName, lastName, email, phone, subject, message } = req.body;

        // Handle both name formats (single name field or firstName+lastName)
        let fullName;
        if (name) {
            fullName = name;
        } else if (firstName && lastName) {
            fullName = `${firstName} ${lastName}`;
        } else if (firstName) {
            fullName = firstName;
        } else {
            fullName = null;
        }

        // Validate required fields
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, email, subject and message are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a valid email address'
            });
        }

        // Validate message length
        if (message.length < 10) {
            return res.status(400).json({
                status: 'error',
                message: 'Message must be at least 10 characters long'
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                status: 'error',
                message: 'Message must be less than 1000 characters'
            });
        }

        // Send email
        try {
            await sendContactFormEmail({
                name: fullName,
                email,
                phone,
                subject,
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Thank you for your message! We will get back to you soon.'
            });

        } catch (emailError) {
            console.error('Contact form email failed:', emailError);
            res.status(500).json({
                status: 'error',
                message: 'Failed to send your message. Please try again later or contact us directly.'
            });
        }

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error. Please try again later.'
        });
    }
};

// Get contact information
exports.getContactInfo = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            data: {
                email: 'ghumakkadyatriii@gmail.com',
                phone: '+91 6261338159',
                whatsapp: '+91 9027094703',
                address: {
                    line1: 'Ghumakkad Yatri Tours & Travels',
                    line2: 'Near Akruti Computers',
                    city: 'Dibiyapur',
                    state: 'Auraiya',
                    pincode: '206244',
                    country: 'India'
                },
                businessHours: {
                    weekdays: '9:00 AM - 7:00 PM',
                    weekends: '10:00 AM - 6:00 PM'
                },
                socialMedia: {
                    facebook: 'https://facebook.com/ghumakkadyatri',
                    instagram: 'https://instagram.com/ghumakkadyatri',
                    twitter: 'https://twitter.com/ghumakkadyatri',
                    youtube: 'https://youtube.com/ghumakkadyatri'
                }
            }
        });
    } catch (error) {
        console.error('Get contact info error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error. Please try again later.'
        });
    }
};