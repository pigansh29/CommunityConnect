const express = require('express');
const router = express.Router();
const { getDashboardStats, getBlackSpots, getRedTimeZones, seedData } = require('../controllers/analyticsController');
const { protect, admin, moderatorOrAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, moderatorOrAdmin, getDashboardStats);
router.get('/blackspots', protect, getBlackSpots); // Public/Student can also see alerts/map? Requirement says "Community Tab". Let's allow authenticated users.
router.get('/red-zones', protect, moderatorOrAdmin, getRedTimeZones);
router.post('/seed', protect, admin, seedData);

module.exports = router;
