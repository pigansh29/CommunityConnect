import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { login, verifyEmail, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/dashboard');
        } else if (res.requiresVerification) {
            setIsVerifying(true);
            setError(res.message || 'Please check the console for your OTP code.');
        } else {
            setError(res.message);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        const res = await verifyEmail(email, otp);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden font-sans">
                {/* Subtle neon glow in the background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="bg-[#111827] border border-slate-800 p-10 rounded-3xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.15)] w-full max-w-md text-center relative z-10 transition-all duration-500">
                    <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                        <KeyRound className="text-indigo-400 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-2 text-slate-100 tracking-tight">Verify Email</h2>
                    <p className="text-sm text-slate-400 mb-8">Enter the 6-digit code sent to your email to complete login.</p>
                    {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 mb-6 p-3 rounded-xl text-sm">{error}</div>}
                    
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="• • • • • •"
                                className="block w-full px-4 py-4 text-center tracking-[1em] text-3xl font-bold bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-indigo-500"
                        >
                            Verify & Login <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden font-sans">
            {/* Subtle neon glow in the background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="bg-[#111827] border border-slate-800 p-10 rounded-3xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.15)] w-full max-w-md relative z-10 transition-all duration-500">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-slate-100 tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Sign in to access your community hub</p>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 mb-6 p-3 rounded-xl text-sm text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end !mt-2">
                        <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors hover:underline underline-offset-4">Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-indigo-500 mt-8"
                    >
                        Sign In <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                </form>
                
                <div className="mt-8 text-center">
                    <span className="text-slate-500 text-sm">Don't have an account? </span>
                    <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors text-sm hover:underline underline-offset-4">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
