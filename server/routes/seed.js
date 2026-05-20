const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, seedController.getSeedData);
router.post('/log', auth, seedController.logEvent);

module.exports = router;
