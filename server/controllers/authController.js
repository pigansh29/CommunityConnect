const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body; 

    // Secure Role Assignment: Only allow standard user types during open registration
    let assignedRole = 'student'; // Absolute default
    if (['student', 'faculty', 'staff'].includes(role)) {
        assignedRole = role;
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists' });
            } else {
                // Resend verification code if user is not verified yet
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.verificationToken = otp;
                user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
                
                // Update name, password, and role in case they changed it while trying again
                user.name = name;
                user.password = password; 
                user.role = assignedRole;
                
                await user.save();

                try {
                    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                        const sendEmail = require('../utils/sendEmail');
                        // Send email asynchronously
                        sendEmail({
                            email: user.email,
                            subject: 'Community Connect - Verification Code',
                            message: `Welcome back to Community Connect! Your email verification code is: ${otp}\nThis code will expire in 10 minutes.`
                        }).then(() => {
                            console.log(`[MAIL] Email sent to ${email}`);
                        }).catch(err => {
                            console.error('Email sending failed:', err);
                        });
                    } else {
                        console.log(`\n\n======================================`);
                        console.log(`[MAIL MOCK] OTP for ${email}: ${otp}\n(Add EMAIL_USER and EMAIL_PASS to .env to send real emails)`);
                        console.log(`======================================\n\n`);
                    }
                } catch (err) {
                    console.error('Error initiating email send:', err);
                }

                return res.status(200).json({
                    message: 'Registration restarted! Please verify your email.',
                    email: user.email,
                    requiresVerification: true
                });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user = new User({
            name,
            email,
            password,
            role: assignedRole,
            verificationToken: otp,
            verificationTokenExpires: otpExpires
        });

        await user.save();

        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const sendEmail = require('../utils/sendEmail');
                // Send email asynchronously
                sendEmail({
                    email: user.email,
                    subject: 'Community Connect - Verification Code',
                    message: `Welcome to Community Connect! Your email verification code is: ${otp}\nThis code will expire in 10 minutes.`
                }).then(() => {
                    console.log(`[MAIL] Email sent to ${email}`);
                }).catch((err) => {
                    console.error('Email sending failed:', err);
                });
            } else {
                console.log(`\n\n======================================`);
                console.log(`[MAIL MOCK] OTP for ${email}: ${otp}\n(Add EMAIL_USER and EMAIL_PASS to .env to send real emails)`);
                console.log(`======================================\n\n`);
            }
        } catch (err) {
            console.error('Error initiating email send:', err);
        }

        res.status(201).json({
            message: 'Registration successful! Please verify your email.',
            email: user.email,
            requiresVerification: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            if (!user.isVerified) {
                // Generate a new OTP if trying to login without verification
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.verificationToken = otp;
                user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
                await user.save();

                try {
                    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                        const sendEmail = require('../utils/sendEmail');
                        // Send email asynchronously
                        sendEmail({
                            email: user.email,
                            subject: 'Community Connect - New Verification Code',
                            message: `Your new email verification code is: ${otp}\nThis code will expire in 10 minutes.`
                        }).then(() => {
                            console.log(`[MAIL] Resent email to ${email}`);
                        }).catch((err) => {
                            console.error('Email sending failed:', err);
                        });
                    } else {
                        console.log(`\n\n======================================`);
                        console.log(`[MAIL MOCK] Resent OTP for ${email}: ${otp}\n(Add EMAIL_USER and EMAIL_PASS to .env to send real emails)`);
                        console.log(`======================================\n\n`);
                    }
                } catch (err) {
                    console.error('Error initiating email send:', err);
                }

                return res.status(403).json({ 
                    message: 'Please verify your email address. A new code has been sent.',
                    requiresVerification: true,
                    email: user.email 
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify user email with OTP
// @route   POST /api/auth/verify
// @access  Public
exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (user.verificationToken !== otp || user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
