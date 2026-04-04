const Complaint = require('../models/Complaint');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { getRealWordRatio } = require('../utils/dictionaryCheck');
const sendEmail = require('../utils/sendEmail');

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

        // --- 1b. Gibberish / Nonsense Detection (Dictionary Check) ---
        // We cross-reference every meaningful word (3+ chars) against a 274,000-word
        // English dictionary. If less than 35% of words are real English words,
        // the description is tagged as meaningless and rejected.
        // Threshold is lenient (35%) to allow technical terms, proper nouns, place names, etc.
        const descWordsLower = descWords.map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
        const realWordRatio = getRealWordRatio(descWordsLower);
        if (realWordRatio < 0.35) {
            return res.status(400).json({
                message: 'Your complaint description appears to contain meaningless or random text. Please describe the incident clearly in plain English so we can help you.'
            });
        }

        // --- 2. Duplicate Complaint Detection (same user only) ---
        // Only block the same user from submitting the same thing twice.
        // Different users should be allowed to independently report the same incident.
        if (location && location.areaName) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentComplaints = await Complaint.find({
                user: currentUser._id, // Scope to the SAME user only
                'location.areaName': location.areaName,
                incidentType,
                createdAt: { $gte: twentyFourHoursAgo }
            });

            const newWords = new Set(title.toLowerCase().split(/\s+/));
            for (let rc of recentComplaints) {
                const oldWords = new Set(rc.title.toLowerCase().split(/\s+/));
                const intersection = new Set([...newWords].filter(x => oldWords.has(x)));
                // If more than 50% of the words match, consider it a duplicate from the same user
                if (intersection.size >= (newWords.size * 0.5) && newWords.size > 0) {
                    return res.status(409).json({ 
                        message: 'You have already submitted a similar complaint for this area recently. Our team is already looking into it.' 
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
            user: currentUser._id, // Link user ID even if anonymous to allow tracking
        };

        if (isAnonymous) {
            // --- 3. Anonymous Complaint Rate Limit (1 every 24h) ---
            if (currentUser.lastAnonymousComplaintAt) {
                const lastSubAt = new Date(currentUser.lastAnonymousComplaintAt);
                const diff = Date.now() - lastSubAt.getTime();
                const twentyFourHours = 24 * 60 * 60 * 1000;

                if (diff < twentyFourHours) {
                    const hoursLeft = Math.ceil((twentyFourHours - diff) / (60 * 60 * 1000));
                    return res.status(429).json({ 
                        message: `To ensure platform reliability, anonymous complaints are limited to one per 24 hours. Please try again in about ${hoursLeft} hours.` 
                    });
                }
            }

            // Hash the email for internal tracking/verification (optional but kept for internal metrics)
            const salt = await bcrypt.genSalt(10);
            const emailHash = await bcrypt.hash(currentUser.email, salt);
            complaintData.reporterHash = emailHash;
        }

        const complaint = await Complaint.create(complaintData);

        if (isAnonymous) {
            // Update the user's last anonymous complaint timestamp
            await User.findByIdAndUpdate(currentUser._id, {
                lastAnonymousComplaintAt: new Date()
            });
        }

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
        const { feed } = req.query;

        let query = {};

        if (feed === 'community') {
            // Community hub should see all complaints for the map/alerts except for rejected ones
            query = { status: { $ne: 'Rejected' } };
        } else if (role === 'student') {
            // Students see only their own complaints in their personal dashboard
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

        // --- Sanitization Logic for Anonymous Complaints ---
        // We want users to see their own anonymous complaints, but hide identity from everyone else
        const sanitizedComplaints = complaints.map(complaint => {
            const cObj = complaint.toObject();
            
            if (cObj.isAnonymous) {
                const isOwner = cObj.user && String(cObj.user._id) === String(_id);
                // If it's anonymous and the current user is NOT the owner, strip user info
                if (!isOwner) {
                    delete cObj.user;
                }
            }
            return cObj;
        });

        // Force browsers and proxies (like Render) to never cache this API response
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(sanitizedComplaints);
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

        if (status) {
            complaint.status = status;
        }
        if (resolutionDetails !== undefined) {
            complaint.resolutionDetails = resolutionDetails;
        }

        await complaint.save();

        const user = await User.findById(complaint.user);
        if (user && user.email) {
            try {
                let emailMessage = `Your complaint titled "${complaint.title}" has been updated.\n\nNew Status: ${status}`;
                if (resolutionDetails) {
                    emailMessage += `\nAdmin Comment / Resolution: ${resolutionDetails}`;
                }
                await sendEmail({
                    email: user.email,
                    subject: 'Complaint Status Update - Community Connect',
                    message: emailMessage
                });
            } catch (emailError) {
                console.error("Failed to send update email:", emailError);
            }
        }

        if (req.io) {
            req.io.emit('statusUpdated', complaint.toObject());
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
