import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token and get user details if needed (optional API call)
                    // For now, assuming token persistence implies login until expiration
                    // Ideally, call an endpoint like /api/auth/me
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    setUser(storedUser);

                    // Set default axios header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const { token, ...userData } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            if (error.response?.data?.requiresVerification) {
                return { 
                    success: false, 
                    requiresVerification: true, 
                    email: error.response.data.email, 
                    message: error.response.data.message 
                };
            }
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await axios.post('/api/auth/register', { name, email, password, role });
            // Returns requiresVerification instead of token
            return { 
                success: true, 
                requiresVerification: res.data.requiresVerification, 
                email: res.data.email,
                message: res.data.message
            };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            const res = await axios.post('/api/auth/verify', { email, otp });
            const { token, ...userData } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Verification failed' };
        }
    };

    const sendPasswordResetEmail = async (email) => {
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            return { success: true, message: res.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send reset email' };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            return { success: true, message: res.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Password reset failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyEmail, sendPasswordResetEmail, resetPassword, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
