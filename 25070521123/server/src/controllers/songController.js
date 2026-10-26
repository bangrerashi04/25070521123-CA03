const Song = require('../models/Song');
const { removeUploadedFile } = require('../middleware/upload');

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title: { title: 1 },
  artist: { artist: 1 },
  rating: { rating: -1 },
};

// Keep only the fields a client is allowed to write.
function pickSongFields(body = {}) {
  const allowed = ['title', 'artist', 'album', 'genre', 'year', 'duration', 'rating', 'favorite'];
  const data = {};

  allowed.forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });

  if (data.year !== undefined) data.year = Number(data.year);
  if (data.duration !== undefined) data.duration = Number(data.duration);
  if (data.rating !== undefined) data.rating = Number(data.rating);
  if (data.favorite !== undefined) data.favorite = data.favorite === true || data.favorite === 'true';

  return data;
}

/**
 * Turn an uploaded file (from multer) into the fields stored on the song.
 * The public URL is relative so it works whatever host the API runs on.
 */
function audioFieldsFromFile(file) {
  if (!file) return null;

  return {
    audioUrl: `/uploads/${file.filename}`,
    audioName: file.originalname,
    audioSize: file.size,
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** GET /api/songs?q=&genre=&favorite=&sort= */
exports.getSongs = async (req, res, next) => {
  try {
    const { q, genre, favorite, sort } = req.query;
    const filter = { user: req.userId };

    if (q && String(q).trim()) {
      const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ title: regex }, { artist: regex }, { album: regex }];
    }

    if (genre && genre !== 'All') {
      filter.genre = genre;
    }

    if (favorite === 'true') {
      filter.favorite = true;
    }

    const songs = await Song.find(filter).sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest);

    return res.json({ count: songs.length, songs });
  } catch (error) {
    return next(error);
  }
};

/** GET /api/songs/stats */
exports.getStats = async (req, res, next) => {
  try {
    const songs = await Song.find({ user: req.userId });
    const genreCount = {};

    songs.forEach((song) => {
      genreCount[song.genre] = (genreCount[song.genre] || 0) + 1;
    });

    const totalDuration = songs.reduce((sum, song) => sum + song.duration, 0);
    const ratingSum = songs.reduce((sum, song) => sum + song.rating, 0);

    return res.json({
      total: songs.length,
      artists: new Set(songs.map((song) => song.artist.toLowerCase().trim())).size,
      favorites: songs.filter((song) => song.favorite).length,
      withAudio: songs.filter((song) => Boolean(song.audioUrl)).length,
      avgRating: songs.length ? Math.round((ratingSum / songs.length) * 10) / 10 : 0,
      totalDuration,
      genres: Object.entries(genreCount)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /api/songs/:id */
exports.getSong = async (req, res, next) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, user: req.userId });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    return res.json({ song });
  } catch (error) {
    return next(error);
  }
};

/** POST /api/songs (JSON or multipart/form-data with an "audio" file) */
exports.createSong = async (req, res, next) => {
  try {
    const data = pickSongFields(req.body);

    if (!data.title || !data.artist) {
      // Do not leave an orphaned file behind when validation fails.
      if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Title and artist are required' });
    }

    const audio = audioFieldsFromFile(req.file);
    const song = await Song.create({ ...data, ...(audio || {}), user: req.userId });

    return res.status(201).json({ song });
  } catch (error) {
    if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
    return next(error);
  }
};

/** PUT /api/songs/:id - also accepts a new audio file or removeAudio=true */
exports.updateSong = async (req, res, next) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, user: req.userId });
    if (!song) {
      if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ message: 'Song not found' });
    }

    const data = pickSongFields(req.body);
    Object.assign(song, data);

    const audio = audioFieldsFromFile(req.file);
    const wantsRemoval = req.body?.removeAudio === 'true' || req.body?.removeAudio === true;

    if (audio) {
      removeUploadedFile(song.audioUrl);
      Object.assign(song, audio);
    } else if (wantsRemoval && song.audioUrl) {
      removeUploadedFile(song.audioUrl);
      song.audioUrl = '';
      song.audioName = '';
      song.audioSize = 0;
    }

    await song.save();
    return res.json({ song });
  } catch (error) {
    if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
    return next(error);
  }
};

/** DELETE /api/songs/:id */
exports.deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Remove the audio file too so uploads/ does not grow forever.
    removeUploadedFile(song.audioUrl);

    return res.json({ message: 'Song deleted', id: song.id });
  } catch (error) {
    return next(error);
  }
};
