import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI, authAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import LeaveCard from '../components/LeaveCard';
import DashboardCalendar from '../components/DashboardCalendar';

const EmployeeDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [userBalance, setUserBalance] = useState({
        casual: 12, // Default fallback
        sick: 10,
        paid: 15,
        half_pay: 20
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeaves();
        fetchUserBalance();
    }, []);

    const fetchUserBalance = async () => {
        try {
            const response = await authAPI.getMe();
            if (response.data.data.leaveBalance) {
                setUserBalance(response.data.data.leaveBalance);
            }
        } catch (error) {
            console.error('Failed to fetch user balance', error);
        }
    };

    const LeaveBalanceItem = ({ title, total, remaining, color, barColor }) => {
        const used = total - remaining;
        const percentage = (remaining / total) * 100;

        return (
            <div className="flex flex-col justify-between">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-medium text-brand-600 truncate">{title}</p>
                    <p className="text-lg font-bold text-brand-900">{remaining} <span className="text-xs font-normal text-brand-400">/ {total}</span></p>
                </div>

                <div className="w-full bg-brand-100 rounded-full h-2 mb-1">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${barColor || color}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>

                <div className="text-right text-[10px] text-brand-400">
                    Used: {used} days
                </div>
            </div>
        );
    };

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'all') {
            setFilteredLeaves(leaves);
        } else if (activeTab === 'upcoming') {
            const upcoming = leaves.filter(leave => {
                const startDate = new Date(leave.relievingDate);
                return startDate >= today;
            });
            setFilteredLeaves(upcoming);
        } else if (activeTab === 'archived') {
            const archived = leaves.filter(leave => {
                const endDate = new Date(leave.reportingDate);
                return endDate < today;
            });
            setFilteredLeaves(archived);
        }
    }, [leaves, activeTab]);

    const fetchLeaves = async () => {
        try {
            const response = await leaveAPI.getMyLeaves();
            setLeaves(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this leave request?')) return;

        try {
            await leaveAPI.deleteLeave(id);
            setLeaves(leaves.filter(leave => leave._id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete leave request');
        }
    };

    return (
        <div className="min-h-screen bg-brand-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Dashboard</h1>
                        <p className="mt-1 text-brand-500">Manage and track your leave requests</p>
                    </div>
                    <button
                        onClick={() => navigate('/apply-leave')}
                        className="btn-primary"
                    >
                        <span className="mr-2 text-lg leading-none">+</span> New Request
                    </button>
                </div>

                {/* Top Section: Balances & Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left: Leave Balances (2x2 Grid) */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-brand-900 mb-4">Leave Balance</h2>
                        <div className="bg-white rounded-2xl border border-brand-200 p-4 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                <LeaveBalanceItem
                                    title="Casual Leave (CL)"
                                    total={12}
                                    remaining={userBalance.casual || 0}
                                    color="bg-blue-500"
                                    barColor="bg-blue-500"
                                />
                                <LeaveBalanceItem
                                    title="Sick Leave (SL)"
                                    total={10}
                                    remaining={userBalance.sick || 0}
                                    color="bg-rose-500"
                                    barColor="bg-rose-500"
                                />
                                <LeaveBalanceItem
                                    title="Paid Leave (PL)"
                                    total={15}
                                    remaining={userBalance.paid || 0}
                                    color="bg-emerald-500"
                                    barColor="bg-emerald-500"
                                />
                                <LeaveBalanceItem
                                    title="Half Pay Leave (HPL)"
                                    total={20}
                                    remaining={userBalance.half_pay || 0}
                                    color="bg-purple-500"
                                    barColor="bg-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Calendar */}
                    <div className="h-full">
                        <h2 className="text-xl font-bold text-brand-900 mb-4">Calendar</h2>
                        <DashboardCalendar leaves={leaves} />
                    </div>
                </div>

                {/* Bottom Section: Leave Requests List */}
                <div>
                    <h2 className="text-xl font-bold text-brand-900 mb-4">Leave Requests</h2>
                    <div className="flex space-x-2 mb-6 bg-white p-1 rounded-lg border border-brand-200 shadow-sm w-fit">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'all'
                                ? 'bg-brand-100 text-brand-900'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            All Leaves
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'upcoming'
                                ? 'bg-brand-100 text-brand-900'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'archived'
                                ? 'bg-brand-100 text-brand-900'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            Archived
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg border border-brand-200 border-dashed">
                            <div className="mx-auto h-12 w-12 text-brand-300">
                                <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-brand-900">No {activeTab === 'all' ? '' : activeTab} leave requests</h3>
                            <p className="mt-1 text-sm text-brand-500">
                                {activeTab === 'all'
                                    ? 'Get started by creating a new leave request.'
                                    : `You have no ${activeTab} leave requests.`}
                            </p>
                            {activeTab === 'all' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/apply-leave')}
                                        className="btn-primary"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredLeaves.map((leave) => (
                                <div key={leave._id} className="relative group">
                                    <LeaveCard leave={leave} />
                                    {leave.status === 'pending' && (
                                        <button
                                            onClick={() => handleDelete(leave._id)}
                                            className="absolute top-4 right-4 p-2 text-brand-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            title="Delete Request"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
