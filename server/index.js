const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server to attach Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for the websocket
        methods: ["GET", "POST", "PATCH"]
    }
});

// Inject io instance into every request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https://*.openstreetmap.org", "https://*.basemaps.cartocdn.com", "https://unpkg.com"],
                connectSrc: ["'self'", "https://*.openstreetmap.org", "https://*.basemaps.cartocdn.com", "https://nominatim.openstreetmap.org"],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.use((req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
    });
} else {
    // Routes Placeholder for Development
    app.get('/', (req, res) => {
        res.send('Community Safety API is running in development mode...');
    });
}

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Socket connection listener
io.on('connection', (socket) => {
    console.log('A client connected via WebSocket:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server & WebSocket running on port ${PORT}`);
});
