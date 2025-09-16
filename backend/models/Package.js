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
    updatedAt: { type: Date },
    status: { type: Number, enum: [1, 0], default: 1 }
});

const packageDetailSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    
    // Itinerary with more structure
    details:{
    itinerary: [{
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        activities: [String],
        meals: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'All Meals', 'None'] },
        accommodation: String
    }],
    
    // Original arrays for backward compatibility
    inclusions: [String],
    exclusions: [String],
    terms: [String],
    
    // Additional useful fields
    best_time_to_visit: String,
    group_size: {
        min: { type: Number, default: 2 },
        max: { type: Number, default: 20 }
    },
    
    // Pricing details
    pricing: {
        adult_price: Number,
        child_price: Number
    },
    
    // Images for the package
    gallery: [{
        url: String,
        caption: String,
        type: { type: String, enum: ['hero', 'gallery', 'itinerary'] }
    }],
   
    
    // Reviews/ratings (if you want to store them here)
    reviews: [{
        user_name: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now }
    }]
    },
    
    // Meta information
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by:{type:String}
});

const Package = mongoose.model('Package', packageSchema);
const PackageDetail = mongoose.model('PackageDetail', packageDetailSchema);

module.exports = { Package, PackageDetail };
