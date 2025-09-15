const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    locations: { type: [String], required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    image_url: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId,  required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: Number, enum: [1, 0], default: 1 }
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
