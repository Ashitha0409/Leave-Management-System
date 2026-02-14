import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-brand-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-3 mr-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-brand-900 leading-none">{user?.name}</p>
                                        <p className="text-xs text-brand-500 mt-1 capitalize">{user?.role}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-brand-500 hover:text-brand-900 font-medium transition-colors"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-brand-600 hover:text-brand-900 font-medium text-sm transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
