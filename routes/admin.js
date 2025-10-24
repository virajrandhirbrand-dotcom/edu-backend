const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllCourses,
    deleteCourse,
    getSystemLogs,
    createAdminUser,
    bulkUpdateUsers
} = require('../controllers/adminController');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Dashboard statistics
router.get('/dashboard', checkAuth, requireAdmin, getDashboardStats);

// User management
router.get('/users', checkAuth, requireAdmin, getAllUsers);
router.get('/users/:id', checkAuth, requireAdmin, getUserById);
router.put('/users/:id', checkAuth, requireAdmin, updateUser);
router.delete('/users/:id', checkAuth, requireAdmin, deleteUser);
router.put('/users/bulk', checkAuth, requireAdmin, bulkUpdateUsers);

// Course management
router.get('/courses', checkAuth, requireAdmin, getAllCourses);
router.delete('/courses/:id', checkAuth, requireAdmin, deleteCourse);

// System logs
router.get('/logs', checkAuth, requireAdmin, getSystemLogs);

// Admin user creation (only for first admin)
router.post('/create-admin', createAdminUser);

module.exports = router;





