const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Complaint.deleteMany({});

        console.log('Creating Users...');

        // Admin User
        const admin = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword123',
            role: 'admin',
            isVerified: true
        });
        await admin.save();

        // Student User
        const student = new User({
            name: 'John Doe',
            email: 'student@example.com',
            password: 'studentpassword123',
            role: 'student',
            isVerified: true
        });
        await student.save();

        console.log('Creating Complaints...');

        // Helper to generate random location around a center point
        const getRandomLocation = (centerLat, centerLng, radius = 0.01) => {
            const y0 = centerLat;
            const x0 = centerLng;
            const rd = radius / 111300; // about 111300 meters in one degree

            const u = Math.random();
            const v = Math.random();

            const w = rd * Math.sqrt(u);
            const t = 2 * Math.PI * v;
            const x = w * Math.cos(t);
            const y = w * Math.sin(t);

            return {
                lat: y + y0,
                lng: x + x0,
                areaName: 'Campus Area'
            };
        };

        // Cluster 1: Library/North Campus (High Harassment)
        const libraryCluster = { lat: 28.6139, lng: 77.2090 };
        // Cluster 2: Hostels/South Campus (Theft)
        const hostelCluster = { lat: 28.6100, lng: 77.2050 };

        const complaints = [];
        const incidentTypes = ['Harassment', 'Theft', 'Violence', 'Infrastructure', 'Other'];
        const statuses = ['Submitted', 'Under Review', 'Action Taken', 'Resolved'];

        // Generate 20 complaints for Library Cluster
        for (let i = 0; i < 20; i++) {
            complaints.push({
                title: `Incident #${i + 1} near Library`,
                description: 'Reported suspicious activity and harassment in the evening hours.',
                incidentType: 'Harassment',
                location: getRandomLocation(libraryCluster.lat, libraryCluster.lng),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                isAnonymous: Math.random() > 0.5,
                user: Math.random() > 0.5 ? student._id : null,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random time in past
            });
        }

        // Generate 15 complaints for Hostel Cluster
        for (let i = 0; i < 15; i++) {
            complaints.push({
                title: `Theft Incident #${i + 1} at Hostel`,
                description: 'Bicycle stolen from the parking rack.',
                incidentType: 'Theft',
                location: getRandomLocation(hostelCluster.lat, hostelCluster.lng),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                isAnonymous: false,
                user: student._id,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            });
        }

        // Generate 5 Random scattered incidents
        for (let i = 0; i < 5; i++) {
            complaints.push({
                title: `Infrastructure Issue #${i + 1}`,
                description: 'Street light not working.',
                incidentType: 'Infrastructure',
                location: getRandomLocation(28.6120, 77.2070, 0.02),
                status: 'Submitted',
                isAnonymous: true,
                createdAt: new Date(),
            });
        }

        await Complaint.insertMany(complaints);

        console.log('Data seeded successfully!');
        console.log('Admin: admin@example.com / adminpassword123');
        console.log('Student: student@example.com / studentpassword123');
        console.log(`Created ${complaints.length} complaints.`);

        process.exit();

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
