const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    travelDate: {
        type: Date,
        required: true
    },
    travelers: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'],
        default: 'pending'
    },
    travelerDetails: [{
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        idType: {
            type: String,
            enum: ['passport', 'aadhar', 'driving_license', 'voter_id']
        },
        idNumber: {
            type: String
        }
    }],
    contactDetails: {
        primaryContact: {
            name: String,
            phone: String,
            email: String
        },
        emergencyContact: {
            name: String,
            phone: String,
            relation: String
        }
    },
    paymentDetails: {
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet']
        },
        transactionId: String,
        paymentDate: Date,
        paymentGateway: String
    },
    cancellationDetails: {
        cancelledAt: Date,
        cancellationReason: String,
        refundAmount: Number,
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'rejected']
        }
    },
    specialRequests: String,
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

// // Index for better query performance
// bookingSchema.index({ userId: 1, createdAt: -1 });
// bookingSchema.index({ packageId: 1 });
// bookingSchema.index({ paymentStatus: 1 });
// bookingSchema.index({ travelDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking };