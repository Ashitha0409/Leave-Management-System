import { useState } from 'react';

const DashboardCalendar = ({ leaves }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isLeaveDay = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        checkDate.setHours(0, 0, 0, 0);

        // Find leaves that cover this date
        // Logic: Leave is from Relieving Date (inclusive) to Reporting Date (exclusive) generally, 
        // but let's be generous and check overlaps.

        const activeLeaves = leaves.filter(leave => {
            if (leave.status === 'rejected') return false;

            const start = new Date(leave.relievingDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(leave.reportingDate);
            end.setHours(0, 0, 0, 0);

            // Check if date is within [start, end]
            // Strictly speaking, if Reporting is FN, you are back that day.
            // If Reporting is AN, you are back half day.
            // Let's just highlight the whole range for simplicity or refinement.
            // A simple view: Highlight [Relieving, Reporting].

            return checkDate >= start && checkDate <= end;
        });

        if (activeLeaves.length > 0) {
            // Priority: Approved > Pending
            const approved = activeLeaves.find(l => l.status === 'approved');
            if (approved) return { type: 'approved', leave: approved };
            return { type: 'pending', leave: activeLeaves[0] };
        }
        return null;
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for days before start of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const leaveInfo = isLeaveDay(day);
            let className = "h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-default";

            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            if (isToday) {
                className += " ring-2 ring-primary ring-offset-1";
            }

            if (leaveInfo) {
                if (leaveInfo.type === 'approved') {
                    className += " bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200";
                } else if (leaveInfo.type === 'pending') {
                    className += " bg-amber-100 text-amber-700 font-bold hover:bg-amber-200";
                }
            } else {
                className += " text-brand-700 hover:bg-brand-50";
            }

            days.push(
                <div key={day} className="flex justify-center py-1">
                    <div
                        className={className}
                        title={leaveInfo ? `${leaveInfo.leave.leaveType} (${leaveInfo.type})` : ''}
                    >
                        {day}
                    </div>
                </div>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-brand-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex space-x-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-brand-100 rounded-full text-brand-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-brand-100 rounded-full text-brand-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-brand-400 uppercase tracking-wider py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>

            <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-brand-500">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-emerald-100 rounded-full mr-1.5 border border-emerald-200"></span>
                    Approved
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-amber-100 rounded-full mr-1.5 border border-amber-200"></span>
                    Pending
                </div>
            </div>
        </div>
    );
};

export default DashboardCalendar;
