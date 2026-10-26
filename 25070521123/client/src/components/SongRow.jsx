import {
  ClockIcon,
  DiscIcon,
  HeartIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  StarIcon,
  TrashIcon,
} from './Icons';
import { coverGradient, formatDuration, initials, ratingStars } from '../utils/format';

/**
 * Compact row used by the list view of the library.
 */
export default function SongRow({
  song,
  index = 0,
  onEdit,
  onDelete,
  onToggleFavorite,
  onPlay,
  isPlaying = false,
}) {
  const hasAudio = Boolean(song.audioUrl);

  const cover = (
    <>
      <span className="song-row__cover-initials">{initials(song.title)}</span>
      {hasAudio && (
        <span className="song-row__cover-icon" aria-hidden="true">
          {isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
        </span>
      )}
    </>
  );

  const coverStyle = { background: coverGradient(`${song.title}${song.artist}`) };

  return (
    <article
      className={`song-row ${isPlaying ? 'is-playing' : ''}`}
      style={{ '--delay': `${Math.min(index, 14) * 30}ms` }}
    >
      {hasAudio ? (
        <button
          type="button"
          className="song-row__cover song-row__cover--btn"
          style={coverStyle}
          onClick={() => onPlay(song)}
          aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          aria-pressed={isPlaying}
        >
          {cover}
        </button>
      ) : (
        <div className="song-row__cover" style={coverStyle} aria-hidden="true">
          {cover}
        </div>
      )}

      <div className="song-row__main">
        <h3 title={song.title}>{song.title}</h3>
        <p>
          {song.artist}
          {song.album ? ` \u00b7 ${song.album}` : ''}
        </p>
      </div>

      <span className="song-row__genre">{song.genre}</span>

      <span className="song-row__meta">
        <DiscIcon size={14} /> {song.year}
      </span>

      <span className="song-row__meta">
        <ClockIcon size={14} /> {formatDuration(song.duration)}
      </span>

      <span className="song-row__stars stars" role="img" aria-label={`Rated ${song.rating} out of 5`}>
        {ratingStars(song.rating).map((active, starIndex) => (
          <StarIcon
            key={starIndex}
            size={13}
            filled={active}
            className={active ? 'star is-on' : 'star'}
          />
        ))}
      </span>

      <div className="song-row__actions">
        <button
          type="button"
          className={`heart-btn heart-btn--flat ${song.favorite ? 'is-active' : ''}`}
          onClick={() => onToggleFavorite(song)}
          aria-label={song.favorite ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={song.favorite}
        >
          <HeartIcon size={17} filled={song.favorite} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onEdit(song)}
          aria-label={`Edit ${song.title}`}
        >
          <PencilIcon size={15} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(song)}
          aria-label={`Delete ${song.title}`}
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </article>
  );
}
