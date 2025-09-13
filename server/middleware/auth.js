import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided in Authorization header');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug logging - shows complete payload structure
    console.log('🔧 JWT Decoded payload:', JSON.stringify(decoded, null, 2));
    
    // Extract user ID from various possible locations in JWT payload
    const userId = decoded.id || 
                   decoded.userId || 
                   decoded._id || 
                   decoded.user?.id || 
                   decoded.user?._id ||
                   decoded.sub; // 'sub' is a standard JWT claim for user identifier
    
    // Extract username from various possible locations
    const username = decoded.username || 
                     decoded.user?.username || 
                     decoded.name || 
                     decoded.user?.name;
    
    // Create user object
    req.user = {
      id: userId ? userId.toString() : null, // Ensure it's always a string
      username: username || 'Unknown'
    };
    
    console.log('🔧 Extracted user info:', req.user);
    
    // Validate that we have a user ID
    if (!req.user.id) {
      console.error('❌ No user ID found in token payload');
      console.error('Available properties:', Object.keys(decoded));
      return res.status(401).json({ 
        error: 'Invalid token structure - no user ID found',
        debug: process.env.NODE_ENV === 'development' ? Object.keys(decoded) : undefined
      });
    }
    
    // Additional validation - ensure ID is valid format
    if (req.user.id.length < 10) { // Basic sanity check for MongoDB ObjectId length
      console.error('❌ Invalid user ID format:', req.user.id);
      return res.status(401).json({ error: 'Invalid user ID format in token' });
    }
    
    console.log('✅ Authentication successful for user:', req.user.id);
    next();
    
  } catch (error) {
    console.error('❌ JWT verification failed:', error.name, error.message);
    
    // Provide specific error messages based on error type
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token format' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(403).json({ error: 'Token not active yet' });
    } else {
      return res.status(403).json({ error: 'Token verification failed' });
    }
  }
};

// Optional: Middleware to check if user is authenticated (but not required)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id || decoded.user?.id;
    
    req.user = userId ? {
      id: userId.toString(),
      username: decoded.username || decoded.user?.username || 'Unknown'
    } : null;
    
    next();
  } catch (error) {
    // On optional auth, we don't fail - just set user to null
    req.user = null;
    next();
  }
};
