const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/sleepController');

router.get('/', auth, ctrl.getSleepData);
router.post('/log', auth, ctrl.logSleep);
router.put('/log/:id', auth, ctrl.updateSleepLog);
router.delete('/log/:id', auth, ctrl.deleteSleepLog);
router.post('/settings', auth, ctrl.saveSettings);

module.exports = router;
