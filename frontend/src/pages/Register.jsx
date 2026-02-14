import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee', // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.role
        );
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 card">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-brand-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-brand-500">
                        Join your team for seamless leave management
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="input-label">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="input-label">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input-field"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="input-label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="input-label">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="input-label">Role</label>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <label className={`flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer transition-all ${formData.role === 'employee' ? 'bg-primary bg-opacity-5 border-primary text-primary font-medium' : 'border-brand-300 hover:border-brand-400'}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="employee"
                                        checked={formData.role === 'employee'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span>Employee</span>
                                </label>
                                <label className={`flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer transition-all ${formData.role === 'employer' ? 'bg-primary bg-opacity-5 border-primary text-primary font-medium' : 'border-brand-300 hover:border-brand-400'}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="employer"
                                        checked={formData.role === 'employer'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span>Employer</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-2.5"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-brand-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
