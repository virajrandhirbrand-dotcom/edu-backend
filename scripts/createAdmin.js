const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            return;
        }

        // Create admin user
        const adminUser = new User({
            email: 'admin@educational-platform.com',
            password: 'admin123', // Default password - should be changed
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            isActive: true
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@educational-platform.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login.');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdmin();





