import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ApplyLeave = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        leaveType: 'casual',
        relievingDate: '',
        relievingSession: 'afternoon',
        reportingDate: '',
        reportingSession: 'forenoon',
        sanctioningAuthority: '',
        reason: '',
    });
    const [authorities, setAuthorities] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAuthorities();
    }, []);

    const fetchAuthorities = async () => {
        try {
            const response = await leaveAPI.getSanctioningAuthorities();
            const authData = response.data?.data || [];

            // Filter out current user if they are an employer applying? 
            // Or allow selecting self for testing. Let's allow for now.
            setAuthorities(authData);

            if (authData.length > 0) {
                setFormData(prev => ({ ...prev, sanctioningAuthority: authData[0]._id }));
            }
        } catch (error) {
            console.error('Failed to fetch authorities', error);
            // Optionally set error state to show user
            setError('Could not load sanctioning authorities. Please try again later.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateDays = () => {
        if (!formData.relievingDate || !formData.reportingDate) return 0;

        const start = new Date(formData.relievingDate);
        const end = new Date(formData.reportingDate);

        // Check for invalid dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

        let days = (end - start) / (1000 * 60 * 60 * 24);
        let leaveDays = Math.floor(days);

        if (formData.relievingSession === 'afternoon') leaveDays -= 0.5;
        if (formData.reportingSession === 'afternoon') leaveDays += 0.5;

        return Math.max(0, leaveDays);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (new Date(formData.reportingDate) < new Date(formData.relievingDate)) {
            setError('Reporting date cannot be before relieving date');
            return;
        }

        setLoading(true);
        try {
            await leaveAPI.createLeave(formData);
            navigate('/employee-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Apply for Leave</h1>
                    <p className="mt-2 text-brand-500">Submit a new leave request for approval.</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label">
                                    Employee Name
                                </label>
                                <input
                                    type="text"
                                    value={user?.name || ''}
                                    readOnly
                                    className="input-field bg-gray-100 cursor-not-allowed text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="input-label">
                                    Leave Type
                                </label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="casual">Casual Leave (CL)</option>
                                    <option value="sick">Sick Leave (SL)</option>
                                    <option value="paid">Paid Leave (PL)</option>
                                    <option value="half_pay">Half Pay Leave (HPL)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label">
                                    Sanctioning Authority
                                </label>
                                <select
                                    name="sanctioningAuthority"
                                    value={formData.sanctioningAuthority}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Select Authority</option>
                                    {authorities.map(auth => (
                                        <option key={auth._id} value={auth._id}>{auth.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Relieving Date Section */}
                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">
                                        Relieving Date
                                    </label>
                                    <input
                                        type="date"
                                        name="relievingDate"
                                        value={formData.relievingDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Relieving Session
                                    </label>
                                    <select
                                        name="relievingSession"
                                        value={formData.relievingSession}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="forenoon">Forenoon (FN)</option>
                                        <option value="afternoon">Afternoon (AN)</option>
                                    </select>
                                    <p className="text-xs text-brand-400 mt-1">If AN, leave starts from afternoon.</p>
                                </div>
                            </div>

                            {/* Reporting Date Section */}
                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">
                                        Reporting Date
                                    </label>
                                    <input
                                        type="date"
                                        name="reportingDate"
                                        value={formData.reportingDate}
                                        onChange={handleChange}
                                        min={formData.relievingDate || new Date().toISOString().split('T')[0]}
                                        required
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Reporting Session
                                    </label>
                                    <select
                                        name="reportingSession"
                                        value={formData.reportingSession}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="forenoon">Forenoon (FN)</option>
                                        <option value="afternoon">Afternoon (AN)</option>
                                    </select>
                                    <p className="text-xs text-brand-400 mt-1">If FN, back in morning (Leave till prev day).</p>
                                </div>
                            </div>
                        </div>

                        {calculateDays() > 0 && (
                            <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 p-4 rounded-lg flex items-center justify-between">
                                <span className="text-brand-700 font-medium text-sm">Total Request Duration</span>
                                <span className="text-primary font-bold">
                                    {calculateDays()} <span className="text-sm font-normal text-brand-500">days</span>
                                </span>
                            </div>
                        )}

                        <div>
                            <label className="input-label">
                                Reason for Leave
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="input-field resize-none"
                                placeholder="Please describe the reason for your leave request..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-brand-100">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary min-w-[120px]"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplyLeave;
