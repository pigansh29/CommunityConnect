const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, incidentType, location, isAnonymous, media } = req.body;

        // Use current user from request (added by auth middleware)
        const currentUser = req.user;

        // --- 1. Vague Complaint Detection (Heuristic NLP) ---
        if (!description || !title) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }
        const descWords = description.trim().split(/\s+/);
        const wordCount = descWords.length;
        const uniqueWords = new Set(descWords.map(w => w.toLowerCase())).size;
        
        if (wordCount < 5 || uniqueWords < 4 || description.length < 20) {
            return res.status(400).json({ 
                message: 'Complaint description is too vague. Please provide more details so we can take appropriate action.' 
            });
        }

        // --- 2. Duplicate Complaint Detection ---
        if (location && location.areaName) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentComplaints = await Complaint.find({
                'location.areaName': location.areaName,
                incidentType,
                createdAt: { $gte: twentyFourHoursAgo }
            });

            const newWords = new Set(title.toLowerCase().split(/\s+/));
            for (let rc of recentComplaints) {
                const oldWords = new Set(rc.title.toLowerCase().split(/\s+/));
                const intersection = new Set([...newWords].filter(x => oldWords.has(x)));
                // If more than 50% of the words match, consider it a duplicate
                if (intersection.size >= (newWords.size * 0.5) && newWords.size > 0) {
                    return res.status(409).json({ 
                        message: 'A similar complaint has already been registered in this area recently. Our team is already looking into it.' 
                    });
                }
            }
        }

        let complaintData = {
            title,
            description,
            incidentType,
            location,
            isAnonymous,
            media,
        };

        if (isAnonymous) {
            // Hash the email for internal tracking/verification
            const salt = await bcrypt.genSalt(10);
            const emailHash = await bcrypt.hash(currentUser.email, salt);
            complaintData.reporterHash = emailHash;
            // Do NOT link the user ID directly if anonymous
        } else {
            complaintData.user = currentUser._id;
        }

        const complaint = await Complaint.create(complaintData);

        // Emit the newly created complaint to all connected websocket clients!
        // IMPORTANT: Must use .toObject() so Socket.IO doesn't crash parsing a circular Mongoose Document
        if (req.io) {
            req.io.emit('newIncident', complaint.toObject());
        }

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all complaints (Admin) / My complaints (User)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        const { role, _id } = req.user;

        let query = {};

        if (role === 'student') {
            // Students see only their own complaints
            // Challenge: If anonymous, they are not linked by ID.
            // Option: Return complaints linked by ID. Anonymous ones might not be viewable 
            // in "My History" unless we store ID even for anonymous but hide it from admin?
            // REQUIREMENT: "Normal Reporting" vs "Anonymous Reporting"
            // Let's assume "My Complaints" shows only non-anonymous ones, or we strictly follow 
            // "Admin should NOT see real email".
            // If we want users to track their anonymous complaints, we'd need to link them securely.
            // For now, simple implementation: "My Complaints" = Linked to User ID.
            query = { user: _id };
        } else if (role === 'admin' || role === 'moderator') {
            // Admins and moderators see all
            query = {};
        }

        const complaints = await Complaint.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Force browsers and proxies (like Render) to never cache this API response
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private/Admin
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, resolutionDetails } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status;
        if (resolutionDetails) {
            complaint.resolutionDetails = resolutionDetails;
        }

        await complaint.save();

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
