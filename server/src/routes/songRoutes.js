const express = require('express');
const {
  getSongs,
  getStats,
  getSong,
  createSong,
  updateSong,
  deleteSong,
} = require('../controllers/songController');
const protect = require('../middleware/auth');

const router = express.Router();

// Every song route requires a logged-in user.
router.use(protect);

// /stats must be declared before /:id so it is not captured as an id.
router.get('/stats', getStats);

router.route('/').get(getSongs).post(createSong);
router.route('/:id').get(getSong).put(updateSong).delete(deleteSong);

module.exports = router;
