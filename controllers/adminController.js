const User = require('../models/User');
const Course = require('../models/Course');
const Internship = require('../models/Internship');
const Publication = require('../models/Publication');
const Quiz = require('../models/Quiz');
const Resource = require('../models/Resource');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalCourses = await Course.countDocuments();
        const totalInternships = await Internship.countDocuments();
        const totalPublications = await Publication.countDocuments();
        const totalQuizzes = await Quiz.countDocuments();
        const totalResources = await Resource.countDocuments();

        // Get user distribution by role
        const userStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // Get recent activity
        const recentActivity = await User.find({ lastLogin: { $gte: sevenDaysAgo } })
            .select('email firstName lastName role lastLogin')
            .sort({ lastLogin: -1 })
            .limit(10);

        res.json({
            overview: {
                totalUsers,
                activeUsers,
                totalCourses,
                totalInternships,
                totalPublications,
                totalQuizzes,
                totalResources,
                recentUsers
            },
            userStats,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search, isActive } = req.query;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(filter);

        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNext: page < Math.ceil(totalUsers / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Get user details
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, role, isActive, profilePicture } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        await user.save();

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Don't allow deleting admin users
        if (user.role === 'admin') {
            return res.status(400).json({ error: 'Cannot delete admin users' });
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, instructor } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (instructor) filter.instructor = { $regex: instructor, $options: 'i' };

        const courses = await Course.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalCourses = await Course.countDocuments(filter);

        res.json({
            courses,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses,
                hasNext: page < Math.ceil(totalCourses / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

// Delete course
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findByIdAndDelete(courseId);
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

// Get system logs (recent activity)
exports.getSystemLogs = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        // Get recent user logins
        const recentLogins = await User.find({ lastLogin: { $exists: true } })
            .select('email firstName lastName role lastLogin')
            .sort({ lastLogin: -1 })
            .limit(parseInt(limit));

        // Get recent course creations
        const recentCourses = await Course.find()
            .select('name code instructor createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            recentLogins,
            recentCourses,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching system logs:', error);
        res.status(500).json({ error: 'Failed to fetch system logs' });
    }
};

// Create admin user
exports.createAdminUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const adminUser = new User({
            email,
            password,
            role: 'admin',
            firstName: firstName || 'Admin',
            lastName: lastName || 'User',
            isActive: true
        });

        await adminUser.save();

        res.status(201).json({ 
            message: 'Admin user created successfully',
            user: {
                id: adminUser._id,
                email: adminUser.email,
                role: adminUser.role,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName
            }
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
};

// Bulk operations
exports.bulkUpdateUsers = async (req, res) => {
    try {
        const { userIds, updates } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs array is required' });
        }

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: updates }
        );

        res.json({ 
            message: `${result.modifiedCount} users updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk updating users:', error);
        res.status(500).json({ error: 'Failed to bulk update users' });
    }
};





