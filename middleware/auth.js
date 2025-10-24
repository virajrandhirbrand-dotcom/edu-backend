// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

// Checks if user is logged in
const checkAuth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Checks if user has the required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Forbidden: You do not have the required role.' });
        }
        next();
    };
};

// Ensure both functions are exported correctly in an object
module.exports = { checkAuth, authorize };