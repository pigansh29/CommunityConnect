import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { sendPasswordResetEmail, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const res = await sendPasswordResetEmail(email);
        setLoading(false);

        if (res.success) {
            setSuccessMsg(res.message || 'Reset code sent to your email.');
            setStep(2);
        } else {
            setError(res.message || 'Failed to send reset code.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const res = await resetPassword(email, otp, newPassword);
        setLoading(false);

        if (res.success) {
            setSuccessMsg('Password reset successful. Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setError(res.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden font-sans">
            {/* Subtle neon glow in the background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.15)] w-full max-w-md relative z-10 transition-all duration-500">
                
                {step === 1 ? (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight mb-2">Reset Password</h2>
                            <p className="text-slate-400 text-sm">We'll send a code to your email to reset your password.</p>
                        </div>

                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 mb-4 p-3 rounded-xl text-sm text-center">{error}</div>}
                        
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-sm"
                                        placeholder="you@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-indigo-500 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'} <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-indigo-400 transition-colors text-sm font-medium">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                            <KeyRound className="text-indigo-400 w-8 h-8" />
                        </div>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight mb-2">Verify Code</h2>
                            <p className="text-slate-400 text-sm">Enter the code sent to {email}</p>
                        </div>

                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 mb-4 p-3 rounded-xl text-sm text-center">{error}</div>}
                        {successMsg && <div className="bg-green-500/10 border border-green-500/30 text-green-400 mb-4 p-3 rounded-xl text-sm text-center">{successMsg}</div>}
                        
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-300 ml-1">6-Digit Code</label>
                                <div>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="• • • • • •"
                                        className="block w-full px-4 py-3 text-center tracking-[1em] text-2xl font-bold bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 mt-4">
                                <label className="block text-xs font-medium text-slate-300 ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-sm"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                        minLength="6"
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || successMsg.includes('Redirecting')}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-indigo-500 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button 
                                onClick={() => setStep(1)} 
                                disabled={loading || successMsg.includes('Redirecting')}
                                className="inline-flex items-center text-slate-500 hover:text-indigo-400 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Use a different email
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
