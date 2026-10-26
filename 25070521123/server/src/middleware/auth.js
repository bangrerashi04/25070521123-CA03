const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'melody_dev_secret_change_me';

/**
 * Protect routes: require a valid "Authorization: Bearer <token>" header.
 * On success the decoded user id is attached to req.userId.
 */
function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = protect;
