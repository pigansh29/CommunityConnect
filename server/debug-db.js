const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Complaint = require('./models/Complaint');

dotenv.config();

const checkComplaints = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const lastComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5);
        console.log('Last 5 Complaints:');
        lastComplaints.forEach((c, i) => {
            console.log(`[${i}] Title: ${c.title}, Anonymous: ${c.isAnonymous}, User: ${c.user}, ReporterHash: ${c.reporterHash ? 'Exists' : 'None'}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkComplaints();
