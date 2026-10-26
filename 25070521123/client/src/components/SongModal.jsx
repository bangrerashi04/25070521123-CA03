import { useEffect, useState } from 'react';
import { MAX_AUDIO_BYTES, formatBytes, getErrorMessage } from '../api/client';
import { GENRES } from '../utils/constants';
import { AlertIcon, StarIcon, UploadIcon, XIcon } from './Icons';

const currentYear = new Date().getFullYear();
const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|flac|webm)$/i;

function buildForm(song) {
  if (!song) {
    return {
      title: '',
      artist: '',
      album: '',
      genre: 'Pop',
      year: currentYear,
      minutes: 3,
      seconds: 30,
      rating: 3,
      favorite: false,
    };
  }

  const duration = Number(song.duration) || 0;

  return {
    title: song.title || '',
    artist: song.artist || '',
    album: song.album || '',
    genre: song.genre || 'Other',
    year: song.year || currentYear,
    minutes: Math.floor(duration / 60),
    seconds: duration % 60,
    rating: song.rating || 3,
    favorite: Boolean(song.favorite),
  };
}

export default function SongModal({ open, song, onClose, onSave }) {
  const [form, setForm] = useState(() => buildForm(song));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [audioError, setAudioError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(buildForm(song));
    setError('');
    setSaving(false);
    setAudioFile(null);
    setRemoveAudio(false);
    setAudioError('');
  }, [open, song]);

  // Escape closes the dialog; lock background scrolling while it is open.
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape' && !saving) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, saving]);

  if (!open) return null;

  const existingAudio = Boolean(song?.audioUrl) && !removeAudio;

  function update(field) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
    };
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const looksAudio = /^audio\//i.test(file.type) || AUDIO_EXTENSIONS.test(file.name);

    if (!looksAudio) {
      setAudioError('Choose an audio file (mp3, wav, ogg, m4a, aac, flac or webm).');
      return;
    }

    if (file.size > MAX_AUDIO_BYTES) {
      setAudioError(`That file is ${formatBytes(file.size)}. The limit is 25 MB.`);
      return;
    }

    setAudioError('');
    setAudioFile(file);
    setRemoveAudio(false);

    // Read the real length so the user does not have to type it.
    const objectUrl = URL.createObjectURL(file);
    const probe = new Audio();
    probe.preload = 'metadata';

    probe.onloadedmetadata = () => {
      const total = Math.round(probe.duration);
      if (Number.isFinite(total) && total > 1) {
        setForm((current) => ({
          ...current,
          minutes: Math.floor(total / 60),
          seconds: total % 60,
        }));
      }
      URL.revokeObjectURL(objectUrl);
    };

    probe.onerror = () => URL.revokeObjectURL(objectUrl);
    probe.src = objectUrl;

    // A filename is often a good starting point for the title.
    setForm((current) => {
      if (current.title.trim()) return current;

      const guess = file.name
        .replace(AUDIO_EXTENSIONS, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return guess ? { ...current, title: guess.slice(0, 120) } : current;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const title = form.title.trim();
    const artist = form.artist.trim();

    if (!title || !artist) {
      setError('Song title and artist are required.');
      return;
    }

    const minutes = Number(form.minutes) || 0;
    const seconds = Number(form.seconds) || 0;

    if (minutes < 0 || seconds < 0 || seconds > 59) {
      setError('Duration must use minutes and 0-59 seconds.');
      return;
    }

    const duration = minutes * 60 + seconds;
    if (duration < 1) {
      setError('Duration must be greater than zero.');
      return;
    }

    const year = Number(form.year);
    if (!year || year < 1900 || year > currentYear + 1) {
      setError(`Enter a year between 1900 and ${currentYear + 1}.`);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title,
        artist,
        album: form.album.trim(),
        genre: form.genre,
        year,
        duration,
        rating: Number(form.rating) || 3,
        favorite: form.favorite,
        audioFile,
        removeAudio,
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="song-modal-title">
        <div className="modal__head">
          <div>
            <span className="chip chip--soft">{song ? 'Edit track' : 'New track'}</span>
            <h2 id="song-modal-title">
              {song ? 'Update song details' : 'Add a song to your library'}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <XIcon size={18} />
          </button>
        </div>

        <form className="modal__body form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert" role="alert">
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid-2">
            <label className="field">
              <span>Title *</span>
              <input
                className="input"
                value={form.title}
                onChange={update('title')}
                placeholder="e.g. Midnight City"
                maxLength={120}
                autoFocus
              />
            </label>
            <label className="field">
              <span>Artist *</span>
              <input
                className="input"
                value={form.artist}
                onChange={update('artist')}
                placeholder="e.g. M83"
                maxLength={120}
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Album</span>
              <input
                className="input"
                value={form.album}
                onChange={update('album')}
                placeholder="Optional"
                maxLength={120}
              />
            </label>
            <label className="field">
              <span>Genre</span>
              <select className="input select" value={form.genre} onChange={update('genre')}>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* ---------- audio attachment ---------- */}
          <div className="field">
            <span>Audio file</span>

            <label className={`audio-drop ${audioFile || existingAudio ? 'has-file' : ''}`}>
              <input
                type="file"
                className="audio-drop__input"
                accept="audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.flac,.webm"
                onChange={handleFileChange}
              />

              <span className="audio-drop__icon">
                <UploadIcon size={18} />
              </span>

              <span className="audio-drop__copy">
                <strong>
                  {audioFile
                    ? audioFile.name
                    : existingAudio
                      ? song?.audioName || 'Audio attached'
                      : 'Choose an MP3 from your computer'}
                </strong>
                <small>
                  {audioFile
                    ? `${formatBytes(audioFile.size)} \u00b7 ready to upload`
                    : removeAudio
                      ? 'The attached file will be deleted when you save'
                      : existingAudio
                        ? `${formatBytes(song?.audioSize)} \u00b7 click to replace`
                        : 'mp3, wav, ogg, m4a \u00b7 max 25 MB'}
                </small>
              </span>
            </label>

            {(existingAudio || audioFile) && (
              <button
                type="button"
                className="btn btn--tiny btn--danger-ghost audio-drop__remove"
                onClick={() => {
                  setAudioFile(null);
                  setRemoveAudio(Boolean(song?.audioUrl));
                  setAudioError('');
                }}
              >
                <XIcon size={13} /> {audioFile ? 'Discard selection' : 'Remove audio'}
              </button>
            )}

            {removeAudio && song?.audioUrl && (
              <button
                type="button"
                className="btn btn--tiny audio-drop__remove"
                onClick={() => setRemoveAudio(false)}
              >
                Keep the current file instead
              </button>
            )}

            {audioError && (
              <p className="field__error" role="alert">
                {audioError}
              </p>
            )}
          </div>

          <div className="grid-3">
            <label className="field">
              <span>Year</span>
              <input
                type="number"
                className="input"
                value={form.year}
                onChange={update('year')}
                min="1900"
                max={currentYear + 1}
              />
            </label>
            <label className="field">
              <span>Minutes</span>
              <input
                type="number"
                className="input"
                value={form.minutes}
                onChange={update('minutes')}
                min="0"
                max="599"
              />
            </label>
            <label className="field">
              <span>Seconds</span>
              <input
                type="number"
                className="input"
                value={form.seconds}
                onChange={update('seconds')}
                min="0"
                max="59"
              />
            </label>
          </div>

          <div className="field">
            <span>Rating</span>
            <div className="rating-input" role="radiogroup" aria-label="Song rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={Number(form.rating) === value}
                  aria-label={`${value} out of 5 stars`}
                  className={`rating-star ${value <= Number(form.rating) ? 'is-on' : ''}`}
                  onClick={() => setForm((current) => ({ ...current, rating: value }))}
                >
                  <StarIcon size={22} filled={value <= Number(form.rating)} />
                </button>
              ))}
              <span className="rating-input__value">{form.rating}/5</span>
            </div>
          </div>

          <label className="switch">
            <input type="checkbox" checked={form.favorite} onChange={update('favorite')} />
            <span className="switch__track">
              <span className="switch__thumb" />
            </span>
            <span className="switch__copy">
              <strong>Favourite</strong>
              <small>Keep this track in your favourites</small>
            </span>
          </label>

          <div className="modal__foot">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner spinner--sm" /> Saving...
                </>
              ) : song ? (
                'Save changes'
              ) : (
                'Add track'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
