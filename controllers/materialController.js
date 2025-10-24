const Material = require('../models/Material');
const Course = require('../models/Course');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/materials');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'video/mp4': 'video',
        'video/avi': 'video',
        'video/mov': 'video',
        'video/wmv': 'video',
        'application/pdf': 'pdf',
        'application/vnd.ms-powerpoint': 'slides',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'slides'
    };
    
    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only videos, PDFs, and PowerPoint files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Upload material
exports.uploadMaterial = async (req, res) => {
    try {
        const { title, description, courseId, type, tags } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // Verify course exists and user has permission
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Create material record
        const material = new Material({
            title,
            description,
            type,
            course: courseId,
            uploadedBy: req.user.id,
            filePath: req.file.path,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await material.save();
        
        res.json({
            msg: 'Material uploaded successfully',
            material: {
                id: material._id,
                title: material.title,
                type: material.type,
                fileName: material.fileName,
                fileSize: material.fileSize,
                uploadDate: material.uploadDate
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get materials by course
exports.getMaterialsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { type } = req.query;
        
        let query = { course: courseId };
        if (type) {
            query.type = type;
        }
        
        const materials = await Material.find(query)
            .populate('uploadedBy', 'firstName lastName')
            .sort({ uploadDate: -1 });
            
        res.json(materials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all materials for student
exports.getStudentMaterials = async (req, res) => {
    try {
        const { courseId, type } = req.query;
        
        let query = { isPublic: true };
        if (courseId) {
            query.course = courseId;
        }
        if (type) {
            query.type = type;
        }
        
        const materials = await Material.find(query)
            .populate('course', 'name code')
            .populate('uploadedBy', 'firstName lastName')
            .sort({ uploadDate: -1 });
            
        res.json(materials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id)
            .populate('course', 'name code')
            .populate('uploadedBy', 'firstName lastName');
            
        if (!material) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        
        // Increment view count
        material.viewCount += 1;
        await material.save();
        
        res.json(material);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Download material
exports.downloadMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        
        // Check if file exists
        if (!fs.existsSync(material.filePath)) {
            return res.status(404).json({ msg: 'File not found on server' });
        }
        
        // Increment download count
        material.downloadCount += 1;
        await material.save();
        
        res.download(material.filePath, material.fileName);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        
        // Check if user has permission to delete
        if (material.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this material' });
        }
        
        // Delete file from filesystem
        if (fs.existsSync(material.filePath)) {
            fs.unlinkSync(material.filePath);
        }
        
        // Delete from database
        await Material.findByIdAndDelete(req.params.id);
        
        res.json({ msg: 'Material deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Serve material file
exports.serveMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        
        if (!fs.existsSync(material.filePath)) {
            return res.status(404).json({ msg: 'File not found on server' });
        }
        
        res.sendFile(path.resolve(material.filePath));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Middleware for file upload
exports.uploadMiddleware = (req, res, next) => {
    upload.single('material')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }
        next();
    });
};
