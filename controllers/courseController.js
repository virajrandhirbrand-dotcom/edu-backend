const Course = require('../models/Course');

// Get all courses (basic function)
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create course
exports.createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json({ msg: 'Course deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get courses filtered by student's class
exports.getCoursesByClass = async (req, res) => {
    try {
        const userClass = req.user.class;
        
        // If no class is specified, return all courses (fallback)
        if (!userClass) {
            const courses = await Course.find({});
            return res.json(courses);
        }

        // Filter courses by class (extract class number from course name)
        const courses = await Course.find({});
        
        // Filter courses that match the student's class
        const filteredCourses = courses.filter(course => {
            const courseName = course.name.toLowerCase();
            const classNumber = userClass.toString();
            
            // Check if course name contains the class number
            // Look for patterns like "class 1", "-1", "class1", etc.
            const matches = courseName.includes(`class ${classNumber}`) || 
                           courseName.includes(`-${classNumber}`) ||
                           courseName.includes(`class${classNumber}`);
            
            return matches;
        });

        res.json(filteredCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all courses (for teachers and admin)
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};