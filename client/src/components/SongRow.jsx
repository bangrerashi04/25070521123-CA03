import { ClockIcon, DiscIcon, HeartIcon, PencilIcon, StarIcon, TrashIcon } from './Icons';
import { coverGradient, formatDuration, initials, ratingStars } from '../utils/format';

/**
 * Compact row used by the list view of the library.
 */
export default function SongRow({ song, index = 0, onEdit, onDelete, onToggleFavorite }) {
  return (
    <article
      className="song-row"
      style={{ '--delay': `${Math.min(index, 14) * 30}ms` }}
    >
      <div
        className="song-row__cover"
        style={{ background: coverGradient(`${song.title}${song.artist}`) }}
        aria-hidden="true"
      >
        <span>{initials(song.title)}</span>
      </div>

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
