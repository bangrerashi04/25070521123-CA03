const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

// Audio files live in server/uploads so they survive restarts and can be
// served as static assets (express.static supports HTTP range requests,
// which is what lets the <audio> element seek).
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.webm']);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    // Never trust the original name: it may contain spaces, unicode or
    // path separators. Keep only the extension and generate the rest.
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const looksLikeAudio = /^audio\//i.test(file.mimetype);

  if (!ALLOWED_EXTENSIONS.has(ext) || !looksLikeAudio) {
    const error = new Error(
      'Only audio files are allowed (mp3, wav, ogg, m4a, aac, flac, webm)'
    );
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

/** Delete a previously uploaded file, ignoring anything that is not ours. */
function removeUploadedFile(audioUrl) {
  if (!audioUrl) return;

  const name = path.basename(String(audioUrl));
  if (!name) return;

  const target = path.join(UPLOAD_DIR, name);

  // Guard against path traversal, then delete in the background.
  if (!target.startsWith(UPLOAD_DIR)) return;

  fs.promises.unlink(target).catch(() => {
    // The file may already be gone - that is fine.
  });
}

module.exports = { upload, UPLOAD_DIR, MAX_FILE_SIZE, removeUploadedFile };
