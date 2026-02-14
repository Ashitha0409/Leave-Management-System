const Leave = require('../models/Leave');
const User = require('../models/User');

// Helper to calculate leave duration
const calculateLeaveDuration = (relievingDate, relievingSession, reportingDate, reportingSession) => {
    const start = new Date(relievingDate);
    const end = new Date(reportingDate);

    // Difference in milliseconds
    const diffTime = end - start;
    // Convert to days
    let days = diffTime / (1000 * 60 * 60 * 24);

    let leaveDays = Math.floor(days); // Base difference

    // Logic:
    // Relieving AN: Only afternoon off? Or worked till afternoon?
    // "Relieving Date" = Date you leave. 
    // If you relieve AN, you worked FN. So Leave is 0.5 on that day? Or does leave start NEXT day?
    // Usually "Date of Relief" AN means you worked the morning and left.
    // So 0.5 days of leave on Relieving Date.
    // If you relieve FN, you worked 0 days. So 1.0 days of leave on Relieving Date.

    // "Date of Reporting" = Date you return.
    // If you report FN, you are back in morning. No leave on Reporting Date.
    // If you report AN, you missed morning. 0.5 days of leave on Reporting Date.

    // Example: Relieve 1st AN (0.5), Report 2nd FN (0). Total = 0.5. (Diff 1 day). Formula: 1 - 0.5 + 0 = 0.5. Correct.
    // Example: Relieve 1st FN (1.0), Report 2nd FN (0). Total = 1.0. (Diff 1 day). Formula: 1 - 0 + 0 = 1. Correct.
    // Example: Relieve 1st AN (0.5), Report 2nd AN (0.5). Total = 1.0. (Diff 1 day). Formula: 1 - 0.5 + 0.5 = 1. Correct.

    if (relievingSession === 'afternoon') {
        leaveDays -= 0.5;
    }

    if (reportingSession === 'afternoon') {
        leaveDays += 0.5;
    }

    return Math.max(0, leaveDays);
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private (Employee)
exports.createLeave = async (req, res) => {
    try {
        const { leaveType, relievingDate, relievingSession, reportingDate, reportingSession, sanctioningAuthority, reason } = req.body;

        // Validation
        if (!leaveType || !relievingDate || !reportingDate || !reason || !sanctioningAuthority) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // --- Balance Check Integration ---
        const user = await User.findById(req.user._id);

        // Leave Rules Configuration
        const LEAVE_RULES = {
            casual: { maxDays: 3, maxTimes: 6, label: 'Casual Leave' },
            sick: { maxDays: 5, maxTimes: Infinity, label: 'Sick Leave' },
            paid: { maxDays: 10, maxTimes: 3, label: 'Paid Leave' },
            half_pay: { maxDays: 10, maxTimes: Infinity, label: 'Half Pay Leave' }
        };


        const days = calculateLeaveDuration(relievingDate, relievingSession || 'afternoon', reportingDate, reportingSession || 'forenoon');

        if (days <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leave duration'
            });
        }

        // --- Rule Validation ---
        if (LEAVE_RULES[leaveType]) {
            const rule = LEAVE_RULES[leaveType];

            // 1. Max Days per Application Check
            if (days > rule.maxDays) {
                return res.status(400).json({
                    success: false,
                    message: `${rule.label} cannot exceed ${rule.maxDays} days per application.`
                });
            }

            // 2. Max Times per Year Check
            if (rule.maxTimes !== Infinity) {
                const startOfYear = new Date(new Date().getFullYear(), 0, 1);
                const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

                const count = await Leave.countDocuments({
                    employee: req.user._id,
                    leaveType: leaveType,
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                    status: { $in: ['pending', 'approved'] } // Count pending and approved
                });

                if (count >= rule.maxTimes) {
                    return res.status(400).json({
                        success: false,
                        message: `You have reached the maximum limit (${rule.maxTimes} times) for applying ${rule.label} this year.`
                    });
                }
            }
        }
        // -----------------------

        if (['casual', 'sick', 'paid', 'half_pay'].includes(leaveType)) {
            if (user.leaveBalance[leaveType] < days) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[leaveType]}, Requested: ${days}`
                });
            }
        }
        // ---------------------------------

        // Create leave request
        const leave = await Leave.create({
            employee: req.user._id,
            employeeName: req.user.name,
            employeeEmail: req.user.email,
            leaveType,
            relievingDate,
            relievingSession: relievingSession || 'afternoon',
            reportingDate,
            reportingSession: reportingSession || 'forenoon',
            sanctioningAuthority,
            reason
        });

        res.status(201).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating leave request',
            error: error.message
        });
    }
};

// @desc    Get all leave requests for logged in employee
// @route   GET /api/leaves/my-leaves
// @access  Private (Employee)
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.user._id })
            .populate('sanctioningAuthority', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests',
            error: error.message
        });
    }
};

// @desc    Get all leave requests (for employers)
// @route   GET /api/leaves
// @access  Private (Employer)
exports.getAllLeaves = async (req, res) => {
    try {
        // Only show leaves where this user is the sanctioning authority
        const leaves = await Leave.find({ sanctioningAuthority: req.user._id })
            .populate('employee', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests',
            error: error.message
        });
    }
};

// @desc    Update leave status (approve/reject)
// @route   PUT /api/leaves/:id
// @access  Private (Employer)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validation
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status (approved or rejected)'
            });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        // Check authority
        if (leave.sanctioningAuthority.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to sanction this leave'
            });
        }

        // --- Balance Deduction Logic ---
        if (status === 'approved' && leave.status !== 'approved') {
            const user = await User.findById(leave.employee);
            if (user && ['casual', 'sick', 'paid', 'half_pay'].includes(leave.leaveType)) {
                const days = calculateLeaveDuration(
                    leave.relievingDate,
                    leave.relievingSession,
                    leave.reportingDate,
                    leave.reportingSession
                );

                if (user.leaveBalance[leave.leaveType] >= days) {
                    user.leaveBalance[leave.leaveType] -= days;
                    await user.save();
                } else {
                    return res.status(400).json({
                        success: false,
                        message: `User has insufficient balance to approve this leave.`
                    });
                }
            }
        }
        // -------------------------------

        // Update leave status
        leave.status = status;
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = Date.now();

        await leave.save();

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating leave status',
            error: error.message
        });
    }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private (Employee - own leaves only)
exports.deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        // Check if the leave belongs to the logged in user
        if (leave.employee.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this leave request'
            });
        }

        // Can only delete pending leaves
        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a leave request that has been reviewed'
            });
        }

        await leave.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Leave request deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting leave request',
            error: error.message
        });
    }
};

// @desc    Get all potential sanctioning authorities (employers)
// @route   GET /api/users/sanctioning-authorities
// @access  Private
exports.getSanctioningAuthorities = async (req, res) => {
    try {
        const authorities = await User.find({ role: 'employer' }).select('name email _id');
        res.status(200).json({
            success: true,
            data: authorities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sanctioning authorities',
            error: error.message
        });
    }
};
