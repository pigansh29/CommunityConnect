import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Shield, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-lg py-2' : 'bg-slate-900 py-4 shadow-md'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-colors">
                                CampusConnect
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-6">
                            <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:text-white hover:bg-white/10 ${isActive('/') ? 'text-white bg-white/10' : 'text-slate-300'}`}>Home</Link>
                            <Link to="/community" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:text-white hover:bg-white/10 ${isActive('/community') ? 'text-white bg-white/10' : 'text-slate-300'}`}>Community Hub</Link>

                            {user ? (
                                <div className="flex items-center gap-6 pl-4 border-l border-white/10">
                                    <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isActive('/dashboard') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'}`}>
                                        {user.role === 'admin' ? '⚡ Admin Panel' : '📊 My Dashboard'}
                                    </Link>
                                    
                                    <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50 shadow-inner">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white leading-tight">{user.name}</span>
                                            <span className="text-[10px] text-blue-300 uppercase tracking-widest font-black leading-tight">{user.role}</span>
                                        </div>
                                    </div>

                                    <button onClick={logout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 font-semibold border border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/20">
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                    <Link to="/login" className="text-slate-300 hover:text-white font-semibold transition-colors">Login</Link>
                                    <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-4 pt-2 pb-6 space-y-2 shadow-2xl">
                    <Link to="/" className="block px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/10">Home</Link>
                    <Link to="/community" className="block px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/10">Community Hub</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="block px-4 py-3 rounded-lg text-base font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 mt-4 border border-indigo-500/20">
                                {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                            </Link>
                            <div className="flex items-center px-4 py-4 mt-4 bg-slate-800/50 rounded-xl border border-white/5">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md">
                                    {getInitials(user.name)}
                                </div>
                                <div className="ml-4">
                                    <div className="text-base font-bold text-white">{user.name}</div>
                                    <div className="text-xs font-black text-blue-400 mt-1 uppercase tracking-wider">{user.role}</div>
                                </div>
                            </div>
                            <button onClick={logout} className="w-full text-center block px-4 py-3 rounded-lg text-base font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 mt-4">Logout</button>
                        </>
                    ) : (
                        <div className="mt-6 space-y-3">
                            <Link to="/login" className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10">Login</Link>
                            <Link to="/register" className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
