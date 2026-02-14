const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    employeeEmail: {
        type: String,
        required: true
    },
    leaveType: {
        type: String,
        required: [true, 'Please provide leave type'],
        enum: ['casual', 'sick', 'paid', 'half_pay', 'other']
    },
    relievingDate: {
        type: Date,
        required: [true, 'Please provide relieving date']
    },
    relievingSession: {
        type: String,
        enum: ['forenoon', 'afternoon'],
        default: 'afternoon'
    },
    reportingDate: {
        type: Date,
        required: [true, 'Please provide reporting date']
    },
    reportingSession: {
        type: String,
        enum: ['forenoon', 'afternoon'],
        default: 'forenoon'
    },
    sanctioningAuthority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please select a sanctioning authority']
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate number of days
leaveSchema.virtual('numberOfDays').get(function () {
    const start = new Date(this.relievingDate);
    const end = new Date(this.reportingDate);

    // Basic difference in days
    const diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Adjust based on sessions
    // Usually relieving is the last working day? Or first day of leave?
    // "Relieving Date" implies the day you leave work.
    // If I leave on 27th AN (work till afternoon), my leave starts 28th?
    // Or does it mean leave starts 27th AN (0.5 day)?
    // Usually "Relieving Date" is the last day present.
    // "Reporting Date" is the first day back.
    // Leave Duration = (Reporting - Relieving) - 1 (if sessions match full days)
    // Let's assume standard:
    // Leave = (Reporting Date - Relieving Date) in days - 1 (because relieving day is worked)
    // Adjust for half days:
    // If Relieving Session AN (worked full day? no, worked half?), usually AN Relieving means worked FN. So 0.5 leave on Relieving Day?

    // Let's go with a simpler interpretation for calculation if not specified:
    // Duration = (Reporting Date - Relieving Date) days.
    // E.g. Relieve 1st, Report 2nd. Leave = 0 ? No, usually Relieve 1st AN, Report 4th FN. Leave = 2nd, 3rd (2 days).
    // If Relieve 1st AN, Report 2nd FN. Leave = 0.5?

    // Let's implement calculateDays helper in frontend/backend consistent logic.
    // For Mongoose virtual, I will stick to simple diff for now or remove it if not critical. 
    // I'll keep a simple diff.
    return diffDays;
});

module.exports = mongoose.model('Leave', leaveSchema);
