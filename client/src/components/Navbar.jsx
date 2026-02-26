import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Home, Building } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="p-2 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-xl border border-cyan-400/20 shadow-inner mr-3">
                                <Building className="h-7 w-7 text-cyan-300" />
                            </div>
                            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-sm tracking-tight">
                                Wissen Seats
                            </span>
                        </div>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/') ? 'border-cyan-400 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'border-transparent text-gray-300 hover:text-white hover:border-white/30'}`}>
                                <Home className="w-4 h-4 mr-2" /> Dashboard
                            </Link>
                            <Link to="/book" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/book') ? 'border-cyan-400 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'border-transparent text-gray-300 hover:text-white hover:border-white/30'}`}>
                                <Calendar className="w-4 h-4 mr-2" /> Book Seat
                            </Link>
                            <Link to="/weekly" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/weekly') ? 'border-cyan-400 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'border-transparent text-gray-300 hover:text-white hover:border-white/30'}`}>
                                <Calendar className="w-4 h-4 mr-2" /> Weekly View
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center bg-black/20 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                            <span className="text-sm text-gray-300 mr-4 font-medium hidden md:block border-r border-white/10 pr-4">
                                Hello, <span className="text-white font-bold">{user.name}</span> (Batch {user.batch})
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="relative inline-flex items-center text-sm font-medium rounded-lg text-gray-300 hover:text-white transition-all focus:outline-none"
                            >
                                <LogOut className="h-5 w-5 mr-1" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
