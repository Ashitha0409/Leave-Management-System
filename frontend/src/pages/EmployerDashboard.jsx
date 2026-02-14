import { useState, useEffect } from 'react';
import { leaveAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import LeaveCard from '../components/LeaveCard';

const EmployerDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchLeaves();
    }, []);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredLeaves(leaves);
        } else {
            setFilteredLeaves(leaves.filter(leave => leave.status === activeTab));
        }
    }, [leaves, activeTab]);

    const fetchLeaves = async () => {
        try {
            const response = await leaveAPI.getAllLeaves();
            setLeaves(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await leaveAPI.updateLeaveStatus(id, 'approved');
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve leave request');
        }
    };

    const handleReject = async (id) => {
        try {
            await leaveAPI.updateLeaveStatus(id, 'rejected');
            fetchLeaves();
        } catch (error) {
            alert('Failed to reject leave request');
        }
    };

    const TabButton = ({ value, label }) => (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-brand-600 hover:bg-brand-50 border border-brand-200'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-brand-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Admin Dashboard</h1>
                        <p className="mt-1 text-brand-500">Manage leave requests from your team.</p>
                    </div>

                    <div className="flex space-x-2 bg-white p-1 rounded-lg border border-brand-200 shadow-sm self-start md:self-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'all'
                                ? 'bg-brand-100 text-brand-900'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${activeTab === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'text-brand-500 hover:text-brand-700'
                                }`}
                        >
                            Rejected
                        </button>
                    </div>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-brand-900">No requests found</h3>
                        <p className="mt-1 text-sm text-brand-500">
                            {activeTab === 'all' ? 'There are no leave requests yet.' : `There are no ${activeTab} leave requests.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLeaves.map((leave) => (
                            <LeaveCard
                                key={leave._id}
                                leave={leave}
                                isEmployer
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerDashboard;
