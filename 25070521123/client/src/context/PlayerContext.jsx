import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { audioSrc } from '../api/client';
import useLocalStorage from '../hooks/useLocalStorage';

const PlayerContext = createContext(null);

/**
 * One shared <audio> element for the whole app.
 *
 * Songs are played from /uploads on the API host, so playback works for any
 * file the user has attached, with real seeking and volume control.
 */
export function PlayerProvider({ children }) {
  const audioRef = useRef(null);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [volume, setVolume] = useLocalStorage('melody_volume', 0.85);
  const [muted, setMuted] = useState(false);

  const current = index >= 0 && index < queue.length ? queue[index] : null;

  // Load a track into the element and optionally start it.
  const load = useCallback((song, autoplay = true) => {
    const el = audioRef.current;
    if (!el) return;

    const src = audioSrc(song);
    if (!src) {
      setError('This track has no audio file attached');
      setPlaying(false);
      return;
    }

    setError('');
    setTime(0);
    setDuration(Number(song.duration) || 0);

    el.src = src;
    el.load();

    if (autoplay) {
      const attempt = el.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => setPlaying(false));
      }
    }
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.src) return;

    if (el.paused) {
      const attempt = el.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => setPlaying(false));
      }
    } else {
      el.pause();
    }
  }, []);

  /** Play a song; clicking the song that is already loaded toggles pause. */
  const play = useCallback(
    (song, list = []) => {
      if (!song) return;

      if (current && current.id === song.id) {
        toggle();
        return;
      }

      const nextQueue = list.length ? list : [song];
      const nextIndex = Math.max(0, nextQueue.findIndex((item) => item.id === song.id));

      setQueue(nextQueue);
      setIndex(nextIndex);
      load(song);
    },
    [current, load, toggle]
  );

  /** Move through the queue, skipping tracks without an audio file. */
  const step = useCallback(
    (delta) => {
      if (!queue.length) return;

      let cursor = index;

      for (let attempt = 0; attempt < queue.length; attempt += 1) {
        cursor = (cursor + delta + queue.length) % queue.length;
        const candidate = queue[cursor];

        if (audioSrc(candidate)) {
          setIndex(cursor);
          load(candidate);
          return;
        }
      }
    },
    [queue, index, load]
  );

  const seek = useCallback((seconds) => {
    const el = audioRef.current;
    if (!el) return;

    const next = Math.min(Math.max(0, Number(seconds) || 0), el.duration || 0);
    el.currentTime = next;
    setTime(next);
  }, []);

  const close = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
    setPlaying(false);
    setQueue([]);
    setIndex(-1);
    setTime(0);
    setDuration(0);
    setError('');
  }, []);

  const toggleMute = useCallback(() => setMuted((value) => !value), []);

  // Keep element volume in sync with the persisted preference.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = muted ? 0 : Math.min(1, Math.max(0, Number(volume)));
  }, [volume, muted, current?.id]);

  // Space bar is handled in Home; stop audio when the provider unmounts.
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) el.pause();
    };
  }, []);

  const value = useMemo(
    () => ({
      current,
      queue,
      playing,
      time,
      duration,
      volume,
      muted,
      error,
      play,
      toggle,
      next: () => step(1),
      previous: () => step(-1),
      seek,
      setVolume,
      toggleMute,
      close,
      isPlaying: (song) => Boolean(current && song && current.id === song.id && playing),
      isCurrent: (song) => Boolean(current && song && current.id === song.id),
    }),
    [
      current,
      queue,
      playing,
      time,
      duration,
      volume,
      muted,
      error,
      play,
      toggle,
      step,
      seek,
      setVolume,
      toggleMute,
      close,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}

      <audio
        ref={audioRef}
        preload="metadata"
        hidden
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onEnded={(event) => {
          const hasOther = queue.some((song, position) => position !== index && audioSrc(song));
          if (hasOther) {
            step(1);
          } else {
            // Rewind so the slider and the element agree after the last track.
            event.currentTarget.currentTime = 0;
            setPlaying(false);
            setTime(0);
          }
        }}
        onError={() => {
          if (!audioRef.current?.src) return;
          setError('This audio file could not be played');
          setPlaying(false);
        }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used inside a PlayerProvider');
  }
  return context;
}
