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
const { upload } = require('../middleware/upload');

const router = express.Router();

// Every song route requires a logged-in user.
router.use(protect);

// /stats must be declared before /:id so it is not captured as an id.
router.get('/stats', getStats);

// upload.single() is a no-op for plain JSON requests, so the same endpoints
// accept both application/json and multipart/form-data.
router.route('/').get(getSongs).post(upload.single('audio'), createSong);
router.route('/:id').get(getSong).put(upload.single('audio'), updateSong).delete(deleteSong);

module.exports = router;
