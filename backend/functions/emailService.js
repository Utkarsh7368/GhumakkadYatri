const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Send password reset email
const sendPasswordResetEmail = async (to, resetToken, userName) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: 'Password Reset Request - Ghumakkad Yatri',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Ghumakkad Yatri</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🏔️ Ghumakkad Yatri</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Travel Companion</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                
                <p>Hello ${userName || 'Traveler'},</p>
                
                <p>We received a request to reset your password for your Ghumakkad Yatri account. If you didn't make this request, you can safely ignore this email.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              font-weight: bold; 
                              display: inline-block;
                              font-size: 16px;">
                        Reset My Password
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    Or copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                </p>
                
                <div style="background: #fff; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <p style="margin: 0; font-size: 14px;">
                        <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                    </p>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    If you're having trouble with the button above, you can also reset your password by visiting our website and using the "Forgot Password" feature.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    This email was sent by Ghumakkad Yatri. If you have any questions, please contact our support team.
                    <br><br>
                    © 2025 Ghumakkad Yatri. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

// Send contact form email
const sendContactFormEmail = async (contactData) => {
    const { name, email, subject, message, phone } = contactData;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER, // Send to your business email
        subject: `New Contact Form Submission: ${subject}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🏔️ Ghumakkad Yatri</h1>
                <p style="color: white; margin: 5px 0 0 0;">New Contact Form Submission</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #fff; font-weight: bold; width: 30%;">Name:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Email:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">${email}</td>
                    </tr>
                    ${phone ? `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #fff; font-weight: bold;">Phone:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${phone}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Subject:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">${subject}</td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin: 30px 0 15px 0;">Message:</h3>
                <div style="background: #fff; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea;">
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 5px;">
                    <p style="margin: 0; font-size: 14px; color: #0c5460;">
                        <strong>💡 Quick Actions:</strong> Reply directly to this email to respond to ${name}, or add their details to your CRM system.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `,
        // Also send a plain text version
        text: `
        New Contact Form Submission - Ghumakkad Yatri
        
        Name: ${name}
        Email: ${email}
        ${phone ? `Phone: ${phone}` : ''}
        Subject: ${subject}
        
        Message:
        ${message}
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending contact form email:', error);
        throw new Error('Failed to send contact form email');
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendContactFormEmail
};