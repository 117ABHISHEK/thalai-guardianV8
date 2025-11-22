const express = require('express');
const router = express.Router();
const { searchERaktKosh, mergeDonorSources } = require('../controllers/externalController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/external/eraktkosh/search
// @desc    Search e-RaktKosh for blood availability
// @access  Private
router.get('/eraktkosh/search', searchERaktKosh);

// @route   POST /api/external/merge
// @desc    Merge internal and external donor sources
// @access  Private
router.post('/merge', mergeDonorSources);

module.exports = router;

