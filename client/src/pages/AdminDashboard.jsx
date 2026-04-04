import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Map, BarChart2, CheckCircle, AlertTriangle, Filter, RefreshCw, Layers, Eye, X, Send, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [filter, setFilter] = useState('All');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionNote, setResolutionNote] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, complaintsRes] = await Promise.all([
                axios.get('/api/analytics/dashboard'),
                axios.get('/api/complaints')
            ]);
            setStats(statsRes.data);
            setComplaints(complaintsRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSeedData = async () => {
        if (!window.confirm("This will clear existing data and generate new sample data. Continue?")) return;
        try {
            setSeeding(true);
            await axios.post('/api/analytics/seed');
            alert("Data generated successfully!");
            fetchData();
        } catch (error) {
            console.error("Seeding failed", error);
            alert("Failed to generate data.");
        } finally {
            setSeeding(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedComplaint) return;
        try {
            await axios.patch(`/api/complaints/${selectedComplaint._id}/status`, {
                status: newStatus,
                resolutionDetails: resolutionNote
            });

            // Update local state
            setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, status: newStatus, resolutionDetails: resolutionNote } : c));

            // Refetch stats
            const statsRes = await axios.get('/api/analytics/dashboard');
            setStats(statsRes.data);

            // Close modal and reset
            setSelectedComplaint(null);
            setResolutionNote('');
            alert(`Complaint updated to ${newStatus}`);
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update status.");
        }
    };

    const handleNoteUpdate = async () => {
        if (!selectedComplaint) return;
        try {
            await axios.patch(`/api/complaints/${selectedComplaint._id}/status`, {
                resolutionDetails: resolutionNote
            });

            // Update local state
            setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, resolutionDetails: resolutionNote } : c));
            
            // Just show a subtle success without closing modal so admin can keep working
            alert(`Note updated successfully!`);
        } catch (error) {
            console.error("Note update failed", error);
            alert("Failed to update note.");
        }
    };

    const openModal = (complaint) => {
        setSelectedComplaint(complaint);
        setResolutionNote(complaint.resolutionDetails || '');
    };

    const closeModal = () => {
        setSelectedComplaint(null);
        setResolutionNote('');
    };

    const filteredComplaints = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Admin Dashboard...</div>;

    // Prepare Chart Data
    const categoryData = stats?.categoryStats?.map(item => ({ name: item._id, value: item.count })) || [];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pt-28 pb-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">Admin Command Center</h1>
                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-semibold">Real-time campus safety monitoring</p>
                    </div>
                    <button
                        onClick={handleSeedData}
                        disabled={seeding}
                        className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-5 py-2.5 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-indigo-500/20"
                    >
                        <RefreshCw size={18} className={seeding ? "animate-spin" : ""} />
                        {seeding ? "Generating..." : "Generate Sample Data"}
                    </button>
                </div>

            {/* Empty State */}
            {stats?.counts?.total === 0 && (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center mb-8 border border-dashed border-gray-300">
                    <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Layers size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Incident Data Found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        The dashboard requires incident reports to display analytics and maps. You can click the "Generate Sample Data" button above to populate the database for demonstration purposes.
                    </p>
                    <button
                        onClick={handleSeedData}
                        disabled={seeding}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow transition mx-auto"
                    >
                        <RefreshCw size={18} className={seeding ? "animate-spin" : ""} />
                        {seeding ? "Generating..." : "Generate Sample Data"}
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden group hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Incidents</p>
                            <h2 className="text-4xl font-black text-white mt-1">{stats?.counts?.total || 0}</h2>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400 shadow-inner border border-blue-500/20"><Layers size={28} /></div>
                    </div>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden group hover:shadow-red-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-red-500/20"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Cases</p>
                            <h2 className="text-4xl font-black text-red-400 mt-1">{stats?.counts?.active || 0}</h2>
                        </div>
                        <div className="bg-red-500/20 p-4 rounded-xl text-red-400 shadow-inner border border-red-500/20"><AlertTriangle size={28} /></div>
                    </div>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Resolved</p>
                            <h2 className="text-4xl font-black text-emerald-400 mt-1">{stats?.counts?.resolved || 0}</h2>
                        </div>
                        <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400 shadow-inner border border-emerald-500/20"><CheckCircle size={28} /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Visualizations: Pie Chart */}
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <BarChart2 size={20} className="text-indigo-400" /> Incident Distribution
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }} itemStyle={{ color: '#e2e8f0' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visualizations: Heatmap */}
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Map size={20} className="text-red-400" /> Black Spots Heatmap
                    </h3>
                    <div className="flex-grow rounded-xl overflow-hidden border border-slate-600 bg-slate-900 relative h-72 lg:h-auto shadow-inner">
                        <MapContainer center={[28.6120, 77.2070]} zoom={14} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {/* Visualizing density with CircleMarkers for now, simulating heatmap */}
                            {complaints.map((c) => (
                                <CircleMarker
                                    key={c._id}
                                    center={[c.location.lat, c.location.lng]}
                                    radius={c.incidentType === 'Harassment' ? 12 : 8}
                                    pathOptions={{
                                        color: c.incidentType === 'Harassment' ? '#ef4444' : '#f59e0b',
                                        fillColor: c.incidentType === 'Harassment' ? '#ef4444' : '#f59e0b',
                                        fillOpacity: 0.6,
                                        stroke: false
                                    }}
                                >
                                    <Popup className="dark-popup text-slate-800">
                                        <b>{c.incidentType}</b><br />{c.location.areaName}
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                        <div className="absolute bottom-3 right-3 bg-slate-800/90 backdrop-blur text-slate-300 px-3 py-1.5 text-xs rounded-md shadow-lg border border-slate-600 z-[1000]">
                            🔴 High Severity (Harassment/Violence)
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaint Management Table */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/50">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Layers size={20} className="text-indigo-400" /> Incident Management Logs
                    </h3>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none transition-colors hover:border-slate-500"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Submitted">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-900/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Incident</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">No complaints found.</td>
                                </tr>
                            ) : filteredComplaints.map((complaint) => (
                                <tr key={complaint._id} className="bg-transparent hover:bg-slate-700/30 transition-colors duration-200">
                                    <td className="px-6 py-4 font-medium text-slate-200">
                                        <div className="mb-1">{complaint.title}</div>
                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-700 text-slate-300 mb-1">
                                            {complaint.incidentType}
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                            {complaint.isAnonymous ? 'Anonymous' : (complaint.user?.name || 'Unknown')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{complaint.location.areaName}</td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border
                                            ${complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                complaint.status === 'Action Taken' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    complaint.status === 'Rejected' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                        complaint.status === 'Submitted' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openModal(complaint)}
                                            className="text-indigo-400 hover:text-indigo-300 flex items-center justify-end gap-1.5 ml-auto transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-md border border-indigo-500/10"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Incident Details Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedComplaint.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{selectedComplaint.incidentType}</span>
                                    <span>•</span>
                                    <span>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Description */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    {selectedComplaint.description}
                                </p>
                            </div>

                            {/* Location & Reporter */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Location Information</h4>
                                    <p className="text-sm text-gray-800 flex items-start gap-1 font-medium bg-gray-50 border border-gray-200 p-2 rounded">
                                        <MapPin size={16} className="mt-0.5 text-blue-500 shrink-0" />
                                        <span>{selectedComplaint.location.areaName}</span>
                                    </p>
                                    <div className="mt-2 h-32 rounded border border-gray-200 overflow-hidden relative">
                                        <MapContainer 
                                            center={[selectedComplaint.location.lat, selectedComplaint.location.lng]} 
                                            zoom={16} 
                                            style={{ height: '100%', width: '100%' }}
                                            zoomControl={false}
                                            dragging={false}
                                            scrollWheelZoom={false}
                                            doubleClickZoom={false}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                            />
                                            <CircleMarker
                                                center={[selectedComplaint.location.lat, selectedComplaint.location.lng]}
                                                radius={8}
                                                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.6 }}
                                            />
                                        </MapContainer>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                        Lat: {selectedComplaint.location.lat.toFixed(6)}, Lng: {selectedComplaint.location.lng.toFixed(6)}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Reporter</h4>
                                    {selectedComplaint.isAnonymous ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Anonymous
                                        </span>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="text-gray-800 font-medium">{selectedComplaint.user?.name}</span>
                                            <span className="text-xs text-gray-500">{selectedComplaint.user?.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr />

                            {/* Action Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-700">Admin Action & Resolution</h4>
                                    <button 
                                        onClick={handleNoteUpdate}
                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 text-xs font-semibold rounded-md shadow-sm transition"
                                    >
                                        Save Note Only
                                    </button>
                                </div>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    rows="3"
                                    placeholder="Add resolution notes or comments..."
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                ></textarea>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate('Under Review')}
                                        className={`px-4 py-2 rounded-md transition text-sm font-medium
                                            ${selectedComplaint.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                                        `}
                                    >
                                        Mark Under Review
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('Action Taken')}
                                        className={`px-4 py-2 rounded-md transition text-sm font-medium
                                            ${selectedComplaint.status === 'Action Taken' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                                        `}
                                    >
                                        Mark Action Taken
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('Rejected')}
                                        className={`px-4 py-2 rounded-md transition text-sm font-medium
                                            ${selectedComplaint.status === 'Rejected' ? 'bg-gray-200 text-gray-800 border border-gray-300' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                                        `}
                                    >
                                        Reject Complaint
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('Resolved')}
                                        className={`px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2 ml-auto
                                            ${selectedComplaint.status === 'Resolved' ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-700 shadow'}
                                        `}
                                    >
                                        <CheckCircle size={16} /> Mark as Resolved
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default AdminDashboard;
