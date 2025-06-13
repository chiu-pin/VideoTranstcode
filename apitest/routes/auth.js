const AWS = require('aws-sdk');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../jwt'); // Import JWT verification middleware

module.exports = (connection) => {
    const router = express.Router();

    // Configure Cognito
    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: 'ap-southeast-2'
    });

    const CLIENT_ID = '4a9vpkecp77drf5v1bcamtcad4';  // Replace with your Client ID
    const USER_POOL_ID = 'ap-southeast-2_KMBAUmBxw';  // Replace with your User Pool ID
    const ADMIN_GROUP = 'admin';  // Admin group to check for

    // User signup
    router.post('/signup', async (req, res) => {
        const { username, password, email } = req.body;

        const params = {
            ClientId: CLIENT_ID,
            Username: username,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };

        try {
            // Send signup request to Cognito
            const data = await cognito.signUp(params).promise();
            
            // Signup successful, get UserSub (unique Cognito ID)
            const cognitoId = data.UserSub;

            // Save user information to RDS
            connection.query(
                'INSERT INTO user_data (cognito_id, username, email) VALUES (?, ?, ?)',
                [cognitoId, username, email],
                (error, results) => {
                    if (error) {
                        console.error('Error saving user to RDS:', error);
                        return res.status(500).json({ message: 'Error saving user to RDS', error });
                    }

                    // Signup successful, notify user to wait for admin verification
                    res.json({ message: 'User signup successful. Please wait for admin confirmation.', data });
                }
            );
        } catch (err) {
            // Handle Cognito signup error
            console.error('Cognito sign-up error:', err);
            res.status(500).json({ message: 'Error signing up user', error: err.message });
        }
    });

    // User login
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
    
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        };
    
        try {
            const data = await cognito.initiateAuth(params).promise();
    
            // Ensure AuthenticationResult exists
            if (!data.AuthenticationResult || !data.AuthenticationResult.IdToken) {
                throw new Error('Authentication failed, no token returned.');
            }
    
            const token = data.AuthenticationResult.IdToken;  // Get IdToken (JWT)
    
            // Decode JWT to extract Cognito ID (sub)
            const decodedToken = jwt.decode(token);  
            if (!decodedToken || !decodedToken.sub) {
                throw new Error('Failed to decode JWT token.');
            }
    
            const cognitoId = decodedToken.sub;  // Get Cognito ID (sub)
    
            res.json({
                authToken: token,  // Return JWT token
                userId: cognitoId  // Return Cognito user ID (sub)
            });
        } catch (err) {
            console.error('Login error:', err);  // Log error
            res.status(401).json({ message: 'Login failed', error: err.message });
        }
    });

    // Check if user is admin
    router.get('/check-admin', authenticateToken, (req, res) => {
        // Assume JWT has already been decoded and stored in req.user
        const userGroups = req.user.groups;  // Extract cognito:groups from JWT
        console.log('User groups:', userGroups);

        if (userGroups && userGroups.includes(ADMIN_GROUP)) {
            // User belongs to admin group, return isAdmin as true
            return res.json({ isAdmin: true, message: 'User is an admin, access granted.' });
        } else {
            // User does not belong to admin group, return isAdmin as false
            return res.status(403).json({ isAdmin: false, message: 'User is not an admin, access denied.' });
        }
    });

    return router;
};