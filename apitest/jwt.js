const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize JWKS client to get public keys from Cognito
const client = jwksClient({
  jwksUri: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_KMBAUmBxw/.well-known/jwks.json'  // Replace with your Cognito User Pool's JWKS URI
});

// Get the public key for JWT verification
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// JWT verification middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Get the JWT token
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }

    // Token verified successfully, save decoded token to req.user
    req.user = decoded;
    const cognitoId = decoded.sub;  // Extract Cognito ID (sub) from JWT
    const groups = decoded['cognito:groups']; // Extract cognito:groups (user groups)
    console.log(groups);
    req.user = {
      cognitoId: cognitoId,
      groups: groups || []  // Default to empty array if no groups information is present
    };
    next(); // Proceed to the next middleware
  });
}

module.exports = { authenticateToken };