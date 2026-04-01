import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { AlertTriangle, MapPin, Activity, ShieldAlert, Navigation2, CheckCircle2 } from 'lucide-react';

const Community = () => {
    const [alerts, setAlerts] = useState([]);
    const [blackSpots, setBlackSpots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, these would be separate endpoints. 
                // For now, using complaints as a proxy for both alerts and blackspots
                const res = await axios.get('/api/complaints');

                // Filter for "severe" types for alerts
                const severe = res.data.filter(c => ['Violence', 'Harassment', 'Theft'].includes(c.incidentType));
                setAlerts(severe.slice(0, 5)); // Top 5 recent alerts

                // Use all data points for the "Black Spot" map
                setBlackSpots(res.data);
            } catch (error) {
                console.error("Error fetching community data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Connect to Socket.IO for true real-time, cross-device updates (bypassing caching entirely)
        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
        const socket = io(socketUrl, {
            transports: ['websocket'] // Force native WebSockets to bypass Render proxy caching issues
        });

        socket.on('connect', () => {
            console.log('Connected to real-time incident feed');
        });

        // Listen for new incidents pushed instantly from the backend
        socket.on('newIncident', (incident) => {
            console.log("Real-time live incident received from socket pipeline:", incident);
            
            // 1. Instantly drop the new map pin without talking to the database
            setBlackSpots(prev => [incident, ...prev]);

            // 2. Instantly push to the Live Feed if it is a severe incident
            if (['Violence', 'Harassment', 'Theft'].includes(incident.incidentType)) {
                setAlerts(prev => {
                    const newAlerts = [incident, ...prev];
                    return newAlerts.slice(0, 5); // Keep only top 5 recent
                });
            }
        });

        // Cleanup the socket connection when the user leaves the page to prevent memory leaks
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0b1120] text-slate-200 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-violet-600/20 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 animate-fade-in-down">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold mb-6 backdrop-blur-md">
                        <Activity size={18} className="animate-pulse" />
                        <span>Live Feed</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-6 drop-shadow-sm tracking-tight">
                        Community Safety Hub
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Real-time alerts, interactive black spot mapping, and crowdsourced intelligence to keep our university secure.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Alerts Section (Takes 5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 text-red-400">
                                        <ShieldAlert size={24} />
                                    </div>
                                    Priority Alerts
                                </h2>
                                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)]">
                                    LIVE
                                </span>
                            </div>

                            <div className="flex-grow overflow-y-auto max-h-[600px] pr-2 custom-scrollbar space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                                        <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                                        <p className="text-slate-500">Scanning network for alerts...</p>
                                    </div>
                                ) : alerts.length === 0 ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center flex flex-col items-center">
                                        <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
                                        <p className="text-emerald-300 font-medium">No priority alerts matching criteria.</p>
                                        <p className="text-emerald-500/70 text-sm mt-2">The campus is currently reporting normal activity.</p>
                                    </div>
                                ) : (
                                    alerts.map(alert => (
                                        <div key={alert._id} className="group relative bg-slate-900/80 rounded-2xl p-5 border border-slate-700 hover:border-red-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-red-500/10">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg flex items-center gap-2 mb-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
                                                        {alert.incidentType}
                                                    </h3>
                                                    <p className="text-sm text-slate-300 leading-relaxed max-w-sm">{alert.description}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-red-400" />
                                                    <span>{alert.location?.areaName || 'Sector Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                    {new Date(alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Black Spots Map (Takes 7 cols) */}
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 flex flex-col h-full hover:shadow-indigo-500/10 transition-shadow duration-500">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-400">
                                        <Navigation2 size={24} />
                                    </div>
                                    Interactive Threat Map
                                </div>
                                <div className="text-sm font-medium text-slate-400 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700">
                                    {blackSpots.length} Data Points Analyzed
                                </div>
                            </h2>
                            <div className="flex-grow min-h-[500px] h-[500px] lg:h-auto bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-700 relative">
                                <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    {blackSpots.map((spot) => (
                                        <CircleMarker
                                            key={spot._id}
                                            center={[spot.location.lat, spot.location.lng]}
                                            radius={spot.incidentType === 'Harassment' || spot.incidentType === 'Violence' ? 14 : 8}
                                            pathOptions={{ 
                                                color: spot.incidentType === 'Harassment' ? '#ef4444' : '#f59e0b', 
                                                fillColor: spot.incidentType === 'Harassment' ? '#ef4444' : '#f59e0b', 
                                                fillOpacity: 0.5,
                                                weight: 2
                                            }}
                                        >
                                            <Popup className="dark-popup text-slate-800 font-sans">
                                                <div className="p-1">
                                                    <b className="text-base text-slate-900">{spot.incidentType}</b>
                                                    <div className="text-sm text-slate-600 mt-1">{spot.location.areaName}</div>
                                                    <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                                                        Logged: {new Date(spot.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    ))}
                                </MapContainer>
                                
                                {/* Map Overlay Legend */}
                                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-700 z-[1000]">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Threat Level Legend</h4>
                                    <div className="space-y-3 pl-1">
                                        <div className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                                            <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-red-400/50"></span>
                                            High Priority (Violence/Harassment)
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                                            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] border border-orange-400/50"></span>
                                            Standard Priority (Theft/Infra)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Safety Tips Section */}
                <div className="mt-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300 group">
                            <div className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform origin-left">👁️</div>
                            <h3 className="font-bold text-xl text-white mb-3">Maintain Awareness</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">Always be aware of your surroundings, stay in well-lit areas, and avoid distractions like texting while walking at night.</p>
                        </div>
                        <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300 group">
                            <div className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform origin-left">🛡️</div>
                            <h3 className="font-bold text-xl text-white mb-3">Trust Your Instincts</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">If a situation feels anomalous or dangerous, do not hesitate. Remove yourself immediately and alert the authorities.</p>
                        </div>
                        <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300 group">
                            <div className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform origin-left">👥</div>
                            <h3 className="font-bold text-xl text-white mb-3">The Buddy System</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">There is safety in numbers. Coordinate with peers when transiting through identified black spots or during late hours.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;
