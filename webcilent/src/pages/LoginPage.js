import React, { useState, useEffect } from "react";
import "../styles/homepagestyle.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../config.js"; 

const LoginPage = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setToken(token);
            setIsLoggedIn(true);
        }
    }, [setToken]);

    const handleSubmit = async (e) => {
        alert(config.baseUrl)
        e.preventDefault();
        try {
            const response = await axios.post(`${config.baseUrl}/auth/login`, { username, password });
            const { authToken } = response.data;

            setToken(authToken);
            localStorage.setItem('token', authToken);
            setIsLoggedIn(true);

            alert('Login successful!');
        } catch (error) {
            if (error.response) {
                console.error('Login failed:', error.response.data);
                alert('Login failed: ' + error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
                alert('Login failed: No response from server.');
            } else {
                console.error('Login failed:', error.message);
                alert('Login failed: ' + error.message);
            }
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        alert('Logout successful!');
    };

    const handleAdminCheckAndRedirect = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token used for admin check:', token);
            const response = await axios.get(`${config.baseUrl}/auth/check-admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Admin check response:', response.data);

            if (response.data.isAdmin) {
                navigate('/admin');
            } else {
                alert('You are not authorized to access the admin page.');
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            if (error.response) {
                console.error('Response error:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error:', error.message);
            }
            alert('There was an error checking your admin status.');
        }
    };

    const handleSignUp = () => {
        navigate('/signup');  
    };

    return (
        <div className="login-container">
            <h2>{isLoggedIn ? 'Welcome' : 'Login'}</h2>
            {isLoggedIn ? (
                <div>
                    <button onClick={handleLogout}>Logout</button>
                    <button onClick={handleAdminCheckAndRedirect}>Admin</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="login-form">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <div className="button-group">
                        <button type="submit">Login</button>
                        <button type="button" onClick={handleSignUp}>Sign Up</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default LoginPage;
