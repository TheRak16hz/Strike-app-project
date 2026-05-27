const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/nutritionController');

router.get('/', auth, ctrl.getDailyData);
router.get('/library', auth, ctrl.getLibrary);
router.post('/library', auth, ctrl.createFood);
router.delete('/library/:id', auth, ctrl.deleteFood);
router.post('/food', auth, ctrl.logFood);
router.delete('/food/:id', auth, ctrl.deleteLogFood);
router.post('/water', auth, ctrl.logWater);
router.delete('/water/:id', auth, ctrl.deleteWater);
router.post('/caffeine', auth, ctrl.logCaffeine);
router.delete('/caffeine/:id', auth, ctrl.deleteCaffeine);
router.post('/settings', auth, ctrl.saveSettings);
router.get('/profile', auth, ctrl.getProfile);
router.post('/profile', auth, ctrl.saveProfile);
router.get('/bmi', auth, ctrl.getBmi);
router.delete('/all', auth, ctrl.deleteAllNutritionLogs);

module.exports = router;
