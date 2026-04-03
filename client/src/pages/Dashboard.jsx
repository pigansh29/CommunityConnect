import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Clock, MapPin, AlertCircle, CheckCircle2, Shield, X, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const StudentDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const filteredComplaints = complaints.filter(c => 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.incidentType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await axios.get('/api/complaints');
                setComplaints(res.data);
            } catch (error) {
                console.error("Error fetching complaints", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            My Dashboard
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">Track and manage your incident reports.</p>
                    </div>
                    <Link to="/report" className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold overflow-hidden shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <PlusCircle size={20} className="relative z-10" />
                        <span className="relative z-10">Report New Incident</span>
                    </Link>
                </div>

                {/* Dashboard Stats / Info Card */}
                <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl shadow-2xl p-8 mb-10 relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Welcome to your Safety Center</h2>
                        <p className="text-indigo-200 max-w-2xl leading-relaxed">
                            Here you can track the status of the incidents you've reported. <strong>New:</strong> Your anonymous complaints are now privately trackable in your personal history, but remain hidden from admins and other users.
                        </p>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                            <Clock className="text-indigo-500" size={24} /> My Complaints History
                        </h3>
                        {/* Search Bar for Filtering */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search reports..." 
                                className="w-full bg-white border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium tracking-wide">Fetching your history...</p>
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="p-16 text-center flex flex-col items-center">
                                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 size={40} className="text-slate-400" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-700 mb-2">No Results Found</h4>
                                <p className="text-slate-500 max-w-md mx-auto">We couldn't find any reports matching your search. Try different keywords or clear the search field.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {filteredComplaints.map((complaint) => (
                                    <li key={complaint._id} className="p-6 sm:px-8 hover:bg-indigo-50/50 transition duration-300 ease-in-out group">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest bg-slate-800 text-white shadow-sm">
                                                        {complaint.incidentType}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${
                                                        complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        complaint.status === 'Action Taken' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                        complaint.status === 'Submitted' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                    }`}>
                                                        {complaint.status === 'Submitted' && <AlertCircle size={14} />}
                                                        {complaint.status === 'Resolved' && <CheckCircle2 size={14} />}
                                                        {complaint.status}
                                                    </span>
                                                    {complaint.isAnonymous && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                                            <Shield size={10} /> Anonymous
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                                                    {complaint.title}
                                                </h4>
                                                <p className="text-slate-600 text-sm leading-relaxed max-w-3xl line-clamp-2 mb-4">
                                                    {complaint.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                        <MapPin size={14} className="text-slate-400" />
                                                        {complaint.location?.areaName || 'Location Not Provided'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-slate-400" />
                                                        {new Date(complaint.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block">
                                                <button 
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                    className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-indigo-100"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Modal for View Details */}
                {selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-900">Incident Details</h3>
                                <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 rounded-md text-xs uppercase font-bold tracking-widest bg-slate-800 text-white">
                                        {selectedComplaint.incidentType}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                                        selectedComplaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                        selectedComplaint.status === 'Action Taken' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                        selectedComplaint.status === 'Submitted' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                    }`}>
                                        {selectedComplaint.status}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4">{selectedComplaint.title}</h2>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {selectedComplaint.description}
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white">
                                        <MapPin className="text-indigo-500 mt-0.5 shrink-0" size={18} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                            <p className="text-sm font-medium text-slate-800">{selectedComplaint.location?.areaName || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white">
                                        <Calendar className="text-indigo-500 mt-0.5 shrink-0" size={18} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Reported</p>
                                            <p className="text-sm font-medium text-slate-800">{new Date(selectedComplaint.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedComplaint.resolutionDetails && (
                                    <div className="mt-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-900">
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Admin Resolution / Comment</p>
                                        <p className="text-sm font-medium bg-white p-3 rounded border border-indigo-100 shadow-sm mt-1">{selectedComplaint.resolutionDetails}</p>
                                    </div>
                                )}
                                
                                {selectedComplaint.media && selectedComplaint.media.length > 0 && selectedComplaint.media[0] !== "" && (
                                    <div className="mt-6 border-t border-slate-100 pt-6">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Supporting Evidence</p>
                                        <a href={selectedComplaint.media[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 transition-colors">
                                            View Linked Evidence
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
                <Shield size={48} className="text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
                <p className="text-slate-500 mb-6">You need to log in to view your dashboard.</p>
                <Link to="/login" className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                    Go to Login
                </Link>
            </div>
        </div>
    );

    return user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

export default Dashboard;
