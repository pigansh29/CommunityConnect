const Complaint = require('../models/Complaint');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalComplaints = await Complaint.countDocuments();
        const activeCases = await Complaint.countDocuments({ status: { $ne: 'Resolved' } });
        const resolvedCases = await Complaint.countDocuments({ status: 'Resolved' });

        // Category Distribution
        const categoryStats = await Complaint.aggregate([
            { $group: { _id: '$incidentType', count: { $sum: 1 } } }
        ]);

        // Recent Complaints
        const recentComplaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title incidentType location status createdAt');

        res.json({
            counts: {
                total: totalComplaints,
                active: activeCases,
                resolved: resolvedCases,
            },
            categoryStats,
            recentComplaints,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Black Spots (Clustered Data)
// @route   GET /api/analytics/blackspots
// @access  Private
exports.getBlackSpots = async (req, res) => {
    try {
        const complaints = await Complaint.find({}, 'location incidentType createdAt');

        // Simple grouping/clustering logic (can be enhanced with DBSCAN or K-Means later)
        // For now, returning all points for frontend heatmap visualization
        // Frontend libraries like leaflet.heat handle density visualization well
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Red Time Zones (Time-based Analysis)
// @route   GET /api/analytics/red-zones
// @access  Private/Admin
exports.getRedTimeZones = async (req, res) => {
    try {
        // Aggregate complaints by hour of the day
        const timeStats = await Complaint.aggregate([
            {
                $project: {
                    hour: { $hour: "$createdAt" },
                    incidentType: 1
                }
            },
            {
                $group: {
                    _id: "$hour",
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(timeStats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Helper to generate random location
const getRandomLocation = (centerLat, centerLng, radius = 0.01) => {
    const y0 = centerLat;
    const x0 = centerLng;
    const rd = radius / 111300;

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    return {
        lat: y + y0,
        lng: x + x0,
        areaName: 'Campus Area'
    };
};

// @desc    Seed sample data
// @route   POST /api/analytics/seed
// @access  Private/Admin
exports.seedData = async (req, res) => {
    try {
        await Complaint.deleteMany({});

        const libraryCluster = { lat: 28.6139, lng: 77.2090 };
        const hostelCluster = { lat: 28.6100, lng: 77.2050 };

        const complaints = [];
        const incidentTypes = ['Harassment', 'Theft', 'Violence', 'Infrastructure', 'Other'];
        const statuses = ['Submitted', 'Under Review', 'Action Taken', 'Resolved'];

        for (let i = 0; i < 25; i++) {
            complaints.push({
                title: `Incident #${i + 1}`,
                description: 'Generated sample incident description.',
                incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
                location: getRandomLocation(libraryCluster.lat, libraryCluster.lng),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                isAnonymous: Math.random() > 0.5,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 864000000)) // Last 10 days
            });
        }

        for (let i = 0; i < 20; i++) {
            complaints.push({
                title: `Hostel Incident #${i + 1}`,
                description: 'Generated sample incident description.',
                incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
                location: getRandomLocation(hostelCluster.lat, hostelCluster.lng),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                isAnonymous: Math.random() > 0.5,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 864000000))
            });
        }

        await Complaint.insertMany(complaints);

        res.json({ message: 'Data seeded successfully', count: complaints.length });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
