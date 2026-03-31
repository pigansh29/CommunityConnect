const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, admin, moderatorOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createComplaint)
    .get(protect, getComplaints);

router.route('/:id/status')
    .patch(protect, moderatorOrAdmin, updateComplaintStatus);

module.exports = router;
