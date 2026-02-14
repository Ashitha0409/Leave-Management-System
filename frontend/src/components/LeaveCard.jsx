const LeaveCard = ({ leave, onApprove, onReject, isEmployer }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border border-red-200';
            default:
                return 'bg-amber-50 text-amber-700 border border-amber-200';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateDays = () => {
        const start = new Date(leave.relievingDate);
        const end = new Date(leave.reportingDate);
        let days = (end - start) / (1000 * 60 * 60 * 24);
        let leaveDays = Math.floor(days);

        if (leave.relievingSession === 'afternoon') leaveDays -= 0.5;
        if (leave.reportingSession === 'afternoon') leaveDays += 0.5;

        return Math.max(0, leaveDays);
    };

    return (
        <div className="bg-white rounded-lg border border-brand-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    {isEmployer && (
                        <div className="mb-3 pb-3 border-b border-brand-100">
                            <p className="font-semibold text-brand-900">{leave.employeeName}</p>
                            <p className="text-xs text-brand-500">{leave.employeeEmail}</p>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(leave.status)}`}>
                            {leave.status}
                        </span>
                        <span className="mt-2 text-lg font-bold text-brand-900 capitalize tracking-tight">
                            {leave.leaveType === 'half_pay' ? 'Half Pay Leave' : `${leave.leaveType} Leave`}
                        </span>
                    </div>
                </div>
                <div className="text-right bg-brand-50 px-3 py-2 rounded-lg">
                    <p className="text-xs font-medium text-brand-500 uppercase tracking-wider">Duration</p>
                    <p className="text-xl font-bold text-primary">{calculateDays()} <span className="text-sm font-normal text-brand-500">days</span></p>
                </div>
            </div>

            <div className="space-y-3 flex-grow">
                <div>
                    <div className="flex items-center text-sm text-brand-500 mb-1">
                        <svg className="mr-1.5 h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Relieving
                    </div>
                    <p className="text-sm font-medium text-brand-900">
                        {formatDate(leave.relievingDate)} <span className="text-xs text-brand-500 uppercase">({leave.relievingSession === 'forenoon' ? 'FN' : 'AN'})</span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center text-sm text-brand-500 mb-1">
                        <svg className="mr-1.5 h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        Reporting
                    </div>
                    <p className="text-sm font-medium text-brand-900">
                        {formatDate(leave.reportingDate)} <span className="text-xs text-brand-500 uppercase">({leave.reportingSession === 'forenoon' ? 'FN' : 'AN'})</span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center text-sm text-brand-500 mb-1">
                        <svg className="mr-1.5 h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Reason
                    </div>
                    <p className="text-sm text-brand-700 leading-relaxed line-clamp-2">{leave.reason}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between">
                <p className="text-xs text-brand-400">
                    Applied: {formatDate(leave.createdAt)}
                </p>
            </div>

            {isEmployer && leave.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-brand-100 mt-2">
                    <button
                        onClick={() => onApprove(leave._id)}
                        className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => onReject(leave._id)}
                        className="btn-danger flex-1"
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeaveCard;
