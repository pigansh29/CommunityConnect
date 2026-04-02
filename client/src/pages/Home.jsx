import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, MapPin, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-[#0f172a] pt-[120px] pb-32 px-6 lg:px-8">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold mb-8 backdrop-blur-md animate-fade-in-up">
                        <ShieldCheck size={18} />
                        <span>University Safety Initiative 2026</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight animate-fade-in-up animation-delay-100">
                        Safer Campus, <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Together.</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 font-medium">
                        CommunityConnect is a proactive community-based reporting platform designed to detect black spots, prevent mishaps, and ensure a secure environment for everyone.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up animation-delay-300">
                        {user ? (
                            <Link to="/dashboard" className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                <span className="relative z-10">Go To Dashboard</span>
                                <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link to="/register" className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                <span className="relative z-10">Get Started Now</span>
                                <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                        <Link to="/community" className="inline-flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm hover:border-slate-500">
                            View Live Map
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24 relative z-20 -mt-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">How the System Works</h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-6 rounded-full"></div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                            <AlertTriangle className="text-blue-600 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Report Incidents</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            Submit complaints openly or anonymously. Upload photographic evidence and pinpoint exact locations on our interactive mapping interface.
                        </p>
                    </div>
                    
                    {/* Feature 2 */}
                    <div className="group bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-red-100">
                            <MapPin className="text-red-600 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Black Spot Detection</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            Our advanced heuristic engine analyzes cross-referenced reports to automatically identify high-risk areas ("Black Spots") and warns the community.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
                            <Eye className="text-emerald-600 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Authority Action</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            Administrators and moderators receive instant consolidated alerts, track emerging trends, and take targeted preventive measures.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
