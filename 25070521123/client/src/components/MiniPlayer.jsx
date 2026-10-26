import { usePlayer } from '../context/PlayerContext';
import { coverGradient, formatDuration, initials } from '../utils/format';
import {
  AlertIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeMuteIcon,
  XIcon,
} from './Icons';

/**
 * Sticky player bar shown while a track is loaded.
 */
export default function MiniPlayer() {
  const {
    current,
    playing,
    time,
    duration,
    volume,
    muted,
    error,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    close,
  } = usePlayer();

  if (!current) return null;

  const percent = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="player" role="region" aria-label="Audio player">
      <div className="player__inner">
        <div className="player__track">
          <div
            className={`player__cover ${playing ? 'is-playing' : ''}`}
            style={{ background: coverGradient(`${current.title}${current.artist}`) }}
            aria-hidden="true"
          >
            <span>{initials(current.title)}</span>
          </div>

          <div className="player__meta">
            <strong title={current.title}>{current.title}</strong>
            <small title={current.artist}>
              {error ? (
                <span className="player__error">
                  <AlertIcon size={12} /> {error}
                </span>
              ) : (
                <>
                  {current.artist}
                  {current.album ? ` \u00b7 ${current.album}` : ''}
                </>
              )}
            </small>
          </div>
        </div>

        <div className="player__controls">
          <div className="player__buttons">
            <button
              type="button"
              className="player__btn"
              onClick={previous}
              aria-label="Previous track"
              title="Previous track"
            >
              <SkipBackIcon size={16} />
            </button>

            <button
              type="button"
              className="player__btn player__btn--main"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>

            <button
              type="button"
              className="player__btn"
              onClick={next}
              aria-label="Next track"
              title="Next track"
            >
              <SkipForwardIcon size={16} />
            </button>
          </div>

          <div className="player__progress">
            <span className="player__time">{formatDuration(time)}</span>

            <label className="player__range">
              <span className="sr-only">Seek</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(time, duration || 0)}
                onChange={(event) => seek(event.target.value)}
                style={{ '--progress': `${percent}%` }}
                aria-label="Seek within track"
              />
            </label>

            <span className="player__time">{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="player__extras">
          <div className="player__volume">
            <button
              type="button"
              className="player__btn player__btn--ghost"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeMuteIcon size={16} /> : <VolumeIcon size={16} />}
            </button>

            <label className="player__range player__range--volume">
              <span className="sr-only">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(event) => {
                  if (muted) toggleMute();
                  setVolume(Number(event.target.value));
                }}
                style={{ '--progress': `${(muted ? 0 : volume) * 100}%` }}
                aria-label="Volume"
              />
            </label>
          </div>

          <button
            type="button"
            className="player__btn player__btn--ghost"
            onClick={close}
            aria-label="Close player"
            title="Close player"
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
