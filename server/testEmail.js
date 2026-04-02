require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function test() {
    try {
        console.log('Sending test email to', process.env.EMAIL_USER);
        await sendEmail({
            email: process.env.EMAIL_USER,
            subject: 'Test Email',
            message: 'This is a test email'
        });
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

test();
