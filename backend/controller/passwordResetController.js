const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { sendPasswordResetEmail } = require('../functions/emailService');
require('dotenv').config();

// Request password reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal whether email exists or not for security
            return res.status(200).json({
                status: 'success',
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash the token and save to user
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.name);
            
            res.status(200).json({
                status: 'success',
                message: 'Password reset link has been sent to your email address.'
            });
        } catch (emailError) {
            // If email fails, remove reset token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            console.error('Email sending failed:', emailError);
            res.status(500).json({
                status: 'error',
                message: 'Failed to send password reset email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error. Please try again later.'
        });
    }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Reset token is required'
            });
        }

        // Hash the token to compare with stored version
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is invalid or has expired'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Token is valid',
            data: {
                email: user.email
            }
        });

    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error. Please try again later.'
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Token, password and confirm password are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash the token to compare with stored version
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is invalid or has expired'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user password and remove reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error. Please try again later.'
        });
    }
};