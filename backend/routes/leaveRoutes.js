const express = require('express');
const router = express.Router();
const {
    createLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
    deleteLeave,
    getSanctioningAuthorities
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/', authorize('employee'), createLeave);
router.get('/my-leaves', authorize('employee'), getMyLeaves);
router.delete('/:id', authorize('employee'), deleteLeave);
router.get('/sanctioning-authorities', getSanctioningAuthorities);

// Employer routes
router.get('/', authorize('employer'), getAllLeaves);
router.put('/:id', authorize('employer'), updateLeaveStatus);

module.exports = router;
