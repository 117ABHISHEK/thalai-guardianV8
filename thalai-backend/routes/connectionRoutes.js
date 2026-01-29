const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  requestConnection,
  getMyConnections,
  respondToConnection,
  suggestCheckup
} = require('../controllers/connectionController');

router.use(protect);

router.post('/request', requestConnection);
router.get('/', getMyConnections);
router.patch('/:id', respondToConnection);
router.post('/:id/suggest-checkup', suggestCheckup);

module.exports = router;
