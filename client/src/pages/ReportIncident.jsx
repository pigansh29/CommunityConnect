import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Location Picker Component
const LocationMarker = ({ setLocation, isFetchingAddress }) => {
    const [position, setPosition] = useState(null);
    const map = useMapEvents({
        async click(e) {
            setPosition(e.latlng);
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Set initial location state before fetching address
            setLocation({ lat, lng, areaName: "Fetching address..." });
            map.flyTo(e.latlng, map.getZoom());

            try {
                isFetchingAddress(true);
                // Call OpenStreetMap Nominatim API for reverse geocoding using fetch to avoid axios JWT headers
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=communityconnect@example.com`);
                const data = await response.json();

                // Extract best available name
                const address = data.address;
                let areaName = "Unknown Location";

                if (address) {
                    areaName = address.road || address.suburb || address.neighbourhood || address.city_district || address.city || address.town || address.village || address.state || "Selected Location";
                }

                setLocation({ lat, lng, areaName });
            } catch (error) {
                console.error("Error reverse geocoding location:", error);
                // Fallback if API fails
                setLocation({ lat, lng, areaName: "Selected Location" });
            } finally {
                isFetchingAddress(false);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

const ReportIncident = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Default form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [incidentType, setIncidentType] = useState('Harassment');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [location, setLocation] = useState(null);
    const [media, setMedia] = useState(''); // Simple URL input for now

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result); // Base64 string representation of the image
            };
            reader.readAsDataURL(file);
        }
    };
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    // Map Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const mapRef = useRef(null);

    // GPS Auto-Location
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setIsGeolocating(true);
        setError('');
        setIsFetchingAddress(true);
        let resolved = false;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                if (resolved) return;
                resolved = true;
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                // Fly map to user's position
                if (mapRef.current) {
                    mapRef.current.flyTo([lat, lng], 17);
                }
                // Reverse geocode to get area name
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=communityconnect@example.com`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await response.json();
                    const address = data.address;
                    const areaName = address
                        ? (address.road || address.suburb || address.neighbourhood || address.city_district || address.city || address.town || address.village || 'Your Location')
                        : 'Your Location';
                    setLocation({ lat, lng, areaName });
                } catch {
                    setLocation({ lat, lng, areaName: 'Your Location' });
                } finally {
                    setIsGeolocating(false);
                    setIsFetchingAddress(false);
                }
            },
            async (err) => {
                if (resolved) return;
                resolved = true;

                // Fallback to IP-based location if hardware GPS gives an error
                try {
                    const ipRes = await fetch('https://ipapi.co/json/');
                    const ipData = await ipRes.json();
                    if (ipData && ipData.latitude && ipData.longitude) {
                        const lat = ipData.latitude;
                        const lng = ipData.longitude;
                        if (mapRef.current) {
                            mapRef.current.flyTo([lat, lng], 16);
                        }
                        const areaName = ipData.city ? `${ipData.city}, ${ipData.region}` : 'Approximate Location (IP)';
                        setLocation({ lat, lng, areaName });
                        setIsGeolocating(false);
                        setIsFetchingAddress(false);
                        return; // Successfully used fallback!
                    }
                } catch (fallbackError) {
                    console.error('IP Fallback failed', fallbackError);
                }

                setIsGeolocating(false);
                setIsFetchingAddress(false);
                if (err.code === 1) { // PERMISSION_DENIED
                    setError('Location access denied. Please allow location permission in your browser and try again.');
                } else if (err.code === 2) { // POSITION_UNAVAILABLE
                    setError('Location information is unavailable. Ensure your device location services are enabled, or click the map manually.');
                } else if (err.code === 3) { // TIMEOUT
                    setError('Location request timed out. Please try again or click the map manually.');
                } else {
                    setError('Unable to retrieve your location. Please try again or click the map manually.');
                }
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
        );
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError('');
        setSearchResults([]);

        try {
            // Added countrycodes=in to bias results toward India
            // Added limit=5 to return multiple candidates the user can pick from
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5&addressdetails=1&email=communityconnect@example.com`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                if (data.length === 1) {
                    // Only one result — select it immediately
                    selectSearchResult(data[0]);
                } else {
                    // Multiple results — show a dropdown so the user can pick
                    setSearchResults(data);
                }
            } else {
                // Fallback: retry without country restriction in case it's a very specific name
                const fallback = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&limit=5&email=communityconnect@example.com`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const fallbackData = await fallback.json();
                if (fallbackData && fallbackData.length > 0) {
                    setSearchResults(fallbackData);
                } else {
                    setError('Location not found. Try a more specific name, or click directly on the map.');
                }
            }
        } catch (err) {
            console.error('Error searching location:', err);
            setError('Failed to search location. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const selectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setLocation({ lat, lng, areaName: result.display_name });
        setSearchResults([]); // Close the dropdown
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 16);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location) {
            setError('Please select a location on the map');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // In a real app, verify authentication token is attached (handled by axios interceptor in AuthContext)
            const payload = {
                title,
                description,
                incidentType,
                isAnonymous,
                location, // { lat, lng, areaName }
                media: media ? [media] : [],
            };

            await axios.post('/api/complaints', payload);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-4 h-screen flex flex-col overflow-hidden">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 shrink-0">Report an Incident</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 shrink-0 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Form Section */}
                <div className="bg-white p-5 rounded-lg shadow-md flex flex-col overflow-y-auto border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Incident Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={incidentType}
                                onChange={(e) => setIncidentType(e.target.value)}
                                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="Harassment">Harassment</option>
                                <option value="Theft">Theft</option>
                                <option value="Violence">Violence</option>
                                <option value="Infrastructure">Infrastructure Issue</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="2"
                                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Upload (Optional)</label>
                            <div className="flex-1 flex flex-col justify-center px-6 py-3 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50 focus-within:border-blue-500 min-h-[100px]">
                                <div className="space-y-1 text-center w-full">
                                    {media ? (
                                        <div className="flex flex-col items-center">
                                            {media.startsWith('data:image') || media.startsWith('http') ? (
                                                <img src={media} alt="Evidence Preview" className="h-24 object-contain rounded-md mb-2 shadow-sm border border-gray-200" />
                                            ) : (
                                                <div className="h-24 flex items-center justify-center bg-gray-200 rounded-md mb-2 w-full max-w-[150px] text-xs text-gray-500">Invalid Image</div>
                                            )}
                                            <button type="button" onClick={() => setMedia('')} className="text-red-500 text-xs font-semibold hover:text-red-700 bg-red-50 px-2 py-1 rounded-md transition-colors">
                                                Remove Image
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-xs text-gray-600 justify-center mt-2">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 px-2 py-1 shadow-sm border border-gray-200 transition-colors">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center shrink-0 pt-1">
                            <input
                                id="anonymous"
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                                Report Anonymously
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white shrink-0 ${submitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </form>
                </div>

                {/* Map Section */}
                <div className="flex flex-col gap-3 min-h-0 bg-white p-4 rounded-lg shadow-md border border-gray-100">
                    {/* Location Search Bar */}
                    <div className="relative shrink-0">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setSearchResults([]); }}
                                placeholder="Search college, area, landmark..."
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className={`px-4 py-1.5 rounded-md shadow-sm text-sm font-medium text-white ${
                                    isSearching ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition`}
                            >
                                {isSearching ? 'Searching...' : 'Search Map'}
                            </button>
                            {/* GPS Auto-Location Button */}
                            <button
                                type="button"
                                onClick={handleUseMyLocation}
                                disabled={isGeolocating}
                                title="Use my current GPS location"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md shadow-sm text-sm font-medium border transition ${
                                    isGeolocating
                                        ? 'bg-green-50 text-green-400 border-green-200 cursor-wait'
                                        : 'bg-white text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400'
                                }`}
                            >
                                {isGeolocating ? (
                                    <svg className="animate-spin h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                                    </svg>
                                )}
                                {isGeolocating ? 'Locating...' : 'My Location'}
                            </button>
                        </form>
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 z-[2000] bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                {searchResults.map((result, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => selectSearchResult(result)}
                                        className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                                    >
                                        <span className="font-semibold text-gray-900">{result.name || result.display_name.split(',')[0]}</span>
                                        <span className="text-gray-400 ml-1 truncate block">{result.display_name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Adding relative z-0 fixes the navbar overlapping issue */}
                    <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden shadow-inner relative border border-gray-300 z-0 min-h-0">
                        <p className="absolute top-2 left-12 z-[1000] bg-white px-3 py-1.5 rounded shadow text-xs font-bold opacity-90 flex items-center gap-2 max-w-[80%] truncate">
                            {isFetchingAddress && (
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span className="truncate">{location ? location.areaName : "Click map or search a location"}</span>
                        </p>
                        <MapContainer
                            center={[28.6139, 77.2090]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            ref={mapRef}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <LocationMarker setLocation={setLocation} isFetchingAddress={setIsFetchingAddress} />

                            {location && !isFetchingAddress && (
                                <Marker position={[location.lat, location.lng]} />
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIncident;
