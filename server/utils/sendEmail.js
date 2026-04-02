const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Standard integration with Gmail
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define the email options
    const mailOptions = {
        from: `"Community Connect" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Community Connect</h2>
                <p>${options.message.replace(/\n/g, '<br/>')}</p>
                <br/>
                <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply.</p>
            </div>
        `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
