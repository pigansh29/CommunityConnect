const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    incidentType: {
        type: String,
        required: true,
        enum: ['Harassment', 'Theft', 'Violence', 'Infrastructure', 'Other'],
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        areaName: { type: String, required: true },
    },
    media: [{
        type: String, // URLs to images/videos
    }],
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'Action Taken', 'Resolved'],
        default: 'Submitted',
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    // If not anonymous, link to User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // If anonymous, store hash for verification/internal tracking
    reporterHash: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resolutionDetails: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);
