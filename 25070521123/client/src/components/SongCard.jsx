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

export default function SongCard({
  song,
  index = 0,
  onEdit,
  onDelete,
  onToggleFavorite,
  onPlay,
  isPlaying = false,
}) {
  const hasAudio = Boolean(song.audioUrl);

  return (
    <article
      className={`song-card ${isPlaying ? 'is-playing' : ''}`}
      style={{ '--delay': `${Math.min(index, 12) * 45}ms` }}
    >
      <div className="song-card__cover" style={{ background: coverGradient(`${song.title}${song.artist}`) }}>
        <span className="song-card__initials">{initials(song.title)}</span>

        <span className="song-card__genre">{song.genre}</span>

        <button
          type="button"
          className={`heart-btn ${song.favorite ? 'is-active' : ''}`}
          onClick={() => onToggleFavorite(song)}
          aria-label={song.favorite ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={song.favorite}
        >
          <HeartIcon size={18} filled={song.favorite} />
        </button>

        {hasAudio ? (
          <button
            type="button"
            className={`song-card__play ${isPlaying ? 'is-playing' : ''}`}
            onClick={() => onPlay(song)}
            aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
            aria-pressed={isPlaying}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
        ) : null}

        <span className="song-card__shine" aria-hidden="true" />
      </div>

      <div className="song-card__body">
        <div className="song-card__heading">
          <h3 title={song.title}>{song.title}</h3>
          <p>
            {song.artist}
            {song.album ? ` \u00b7 ${song.album}` : ''}
          </p>
        </div>

        <div className="song-card__meta">
          <span>
            <ClockIcon size={14} /> {formatDuration(song.duration)}
          </span>
          <span>
            <DiscIcon size={14} /> {song.year}
          </span>
          <span className="stars" role="img" aria-label={`Rated ${song.rating} out of 5`}>
            {ratingStars(song.rating).map((active, starIndex) => (
              <StarIcon
                key={starIndex}
                size={13}
                filled={active}
                className={active ? 'star is-on' : 'star'}
              />
            ))}
          </span>
        </div>

        <div className="song-card__actions">
          <button type="button" className="btn btn--tiny" onClick={() => onEdit(song)}>
            <PencilIcon size={14} /> Edit
          </button>
          <button
            type="button"
            className="btn btn--tiny btn--danger-ghost"
            onClick={() => onDelete(song)}
          >
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
