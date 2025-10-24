const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const materialController = require('../controllers/materialController');

// Upload material (teachers only) - temporarily disabled
// router.post('/upload', auth, materialController.uploadMiddleware, materialController.uploadMaterial);

// Get materials by course (teachers)
router.get('/course/:courseId', auth, materialController.getMaterialsByCourse);

// Get all materials for students
router.get('/student', auth, materialController.getStudentMaterials);

// Get material by ID
router.get('/:id', auth, materialController.getMaterialById);

// Download material
router.get('/:id/download', auth, materialController.downloadMaterial);

// Serve material file (for viewing)
router.get('/:id/serve', auth, materialController.serveMaterial);

// Delete material (teachers only)
router.delete('/:id', auth, materialController.deleteMaterial);

module.exports = router;
