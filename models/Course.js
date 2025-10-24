const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, required: true },
    credits: { type: Number, required: true },
    instructor: { type: String, required: true },
    semester: { type: String, required: true },
    year: { type: String, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    examDate: { type: Date, default: null }
});

CourseSchema.statics.seed = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding courses...');
        await this.create([
            // 1st Standard Subjects
            { 
                name: 'English - Class 1', 
                code: 'ENG-1', 
                description: 'Basic English language skills, alphabets, and simple words',
                credits: 2,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 60, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 1', 
                code: 'MATH-1', 
                description: 'Basic numbers, counting, and simple arithmetic',
                credits: 2,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 70, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 1', 
                code: 'SCI-1', 
                description: 'Introduction to basic science concepts and nature',
                credits: 2,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 55, 
                examDate: new Date('2025-03-25') 
            },
            
            // 2nd Standard Subjects
            { 
                name: 'English - Class 2', 
                code: 'ENG-2', 
                description: 'Reading, writing, and basic grammar',
                credits: 2,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 65, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 2', 
                code: 'MATH-2', 
                description: 'Addition, subtraction, and basic problem solving',
                credits: 2,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 75, 
                examDate: new Date('2025-03-20') 
            },
            
            // 3rd Standard Subjects
            { 
                name: 'English - Class 3', 
                code: 'ENG-3', 
                description: 'Reading comprehension and creative writing',
                credits: 2,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 70, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 3', 
                code: 'MATH-3', 
                description: 'Multiplication, division, and fractions',
                credits: 2,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 80, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 3', 
                code: 'SCI-3', 
                description: 'Plants, animals, and basic environmental science',
                credits: 2,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 60, 
                examDate: new Date('2025-03-25') 
            },
            
            // 4th Standard Subjects
            { 
                name: 'English - Class 4', 
                code: 'ENG-4', 
                description: 'Advanced grammar and literature',
                credits: 2,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 75, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 4', 
                code: 'MATH-4', 
                description: 'Decimals, geometry, and measurement',
                credits: 2,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 85, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 4', 
                code: 'SCI-4', 
                description: 'Matter, energy, and simple machines',
                credits: 2,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 70, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 4', 
                code: 'SS-4', 
                description: 'History, geography, and civics basics',
                credits: 2,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 65, 
                examDate: new Date('2025-03-30') 
            },
            
            // 5th Standard Subjects
            { 
                name: 'English - Class 5', 
                code: 'ENG-5', 
                description: 'Advanced reading, writing, and communication',
                credits: 2,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 80, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 5', 
                code: 'MATH-5', 
                description: 'Advanced arithmetic and basic algebra',
                credits: 2,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 90, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 5', 
                code: 'SCI-5', 
                description: 'Physics, chemistry, and biology basics',
                credits: 2,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 75, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 5', 
                code: 'SS-5', 
                description: 'Indian history, geography, and government',
                credits: 2,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 70, 
                examDate: new Date('2025-03-30') 
            },
            
            // 6th Standard Subjects
            { 
                name: 'English - Class 6', 
                code: 'ENG-6', 
                description: 'Literature analysis and creative writing',
                credits: 3,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 85, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 6', 
                code: 'MATH-6', 
                description: 'Algebra, geometry, and statistics',
                credits: 3,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 95, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 6', 
                code: 'SCI-6', 
                description: 'Physics, chemistry, and biology fundamentals',
                credits: 3,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 80, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 6', 
                code: 'SS-6', 
                description: 'World history and geography',
                credits: 3,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 75, 
                examDate: new Date('2025-03-30') 
            },
            
            // 7th Standard Subjects
            { 
                name: 'English - Class 7', 
                code: 'ENG-7', 
                description: 'Advanced literature and composition',
                credits: 3,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 90, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 7', 
                code: 'MATH-7', 
                description: 'Advanced algebra and geometry',
                credits: 3,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 7', 
                code: 'SCI-7', 
                description: 'Advanced physics, chemistry, and biology',
                credits: 3,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 85, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 7', 
                code: 'SS-7', 
                description: 'Medieval history and world geography',
                credits: 3,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 80, 
                examDate: new Date('2025-03-30') 
            },
            
            // 8th Standard Subjects
            { 
                name: 'English - Class 8', 
                code: 'ENG-8', 
                description: 'Literature analysis and advanced writing',
                credits: 3,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 95, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 8', 
                code: 'MATH-8', 
                description: 'Algebra, geometry, and trigonometry basics',
                credits: 3,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 8', 
                code: 'SCI-8', 
                description: 'Physics, chemistry, and biology concepts',
                credits: 3,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 90, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 8', 
                code: 'SS-8', 
                description: 'Modern history and political science',
                credits: 3,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 85, 
                examDate: new Date('2025-03-30') 
            },
            
            // 9th Standard Subjects
            { 
                name: 'English - Class 9', 
                code: 'ENG-9', 
                description: 'Literature, grammar, and composition',
                credits: 4,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 9', 
                code: 'MATH-9', 
                description: 'Algebra, geometry, and trigonometry',
                credits: 4,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 9', 
                code: 'SCI-9', 
                description: 'Physics, chemistry, and biology',
                credits: 4,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 95, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 9', 
                code: 'SS-9', 
                description: 'History, geography, and economics',
                credits: 4,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 90, 
                examDate: new Date('2025-03-30') 
            },
            
            // 10th Standard Subjects
            { 
                name: 'English - Class 10', 
                code: 'ENG-10', 
                description: 'Advanced literature and communication skills',
                credits: 4,
                instructor: 'Ms. Sarah Wilson',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-15') 
            },
            { 
                name: 'Mathematics - Class 10', 
                code: 'MATH-10', 
                description: 'Advanced algebra, geometry, and statistics',
                credits: 4,
                instructor: 'Mr. David Kumar',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-20') 
            },
            { 
                name: 'Science - Class 10', 
                code: 'SCI-10', 
                description: 'Physics, chemistry, and biology (Board level)',
                credits: 4,
                instructor: 'Ms. Priya Sharma',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-25') 
            },
            { 
                name: 'Social Studies - Class 10', 
                code: 'SS-10', 
                description: 'History, geography, and political science (Board level)',
                credits: 4,
                instructor: 'Mr. Rajesh Patel',
                semester: 'Academic Year',
                year: '2024-25',
                progress: 100, 
                examDate: new Date('2025-03-30') 
            }
        ]);
    }
};

const Course = mongoose.model('Course', CourseSchema);
// Seeding is now handled in server.js after MongoDB connection

module.exports = Course;