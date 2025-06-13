import React, { useState } from "react";
import "../styles/homepagestyle.css";  
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../config.js";  

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.baseUrl}/auth/signup`, { username, password, email });
            setMessage('Sign up successful!');
            alert('Sign up successful!');
            navigate('/login'); 
        } catch (error) {
            if (error.response) {
                console.error('Sign up failed:', error.response.data);
                setMessage('Sign up failed: ' + error.response.data);
                alert('Sign up failed: ' + error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
                setMessage('Sign up failed: No response from server.');
                alert('Sign up failed: No response from server.');
            } else {
                console.error('Sign up failed:', error.message);
                setMessage('Sign up failed: ' + error.message);
                alert('Sign up failed: ' + error.message);
            }
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="signup-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SignUpPage;
