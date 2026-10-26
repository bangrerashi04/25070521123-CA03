import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import ActiveFilters from '../components/ActiveFilters';
import AnimatedNumber from '../components/AnimatedNumber';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import FilterPills from '../components/FilterPills';
import {
  AlertIcon,
  ChevronDownIcon,
  ClockIcon,
  DiscIcon,
  GridIcon,
  HeadphonesIcon,
  HeartIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
  SparklesIcon,
  StarIcon,
  XIcon,
} from '../components/Icons';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import SongModal from '../components/SongModal';
import SongRow from '../components/SongRow';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { GENRES, SORT_OPTIONS } from '../utils/constants';
import { formatTotalDuration, greeting } from '../utils/format';

const INITIAL_FILTERS = { q: '', genre: 'All', sort: 'newest' };

export default function Home() {
  const { user, logout } = useAuth();
  const { view, setView } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [quick, setQuick] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [modal, setModal] = useState({ open: false, song: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchRef = useRef(null);

  const refreshStats = useCallback(async () => {
    try {
      const { data } = await api.get('/songs/stats');
      setStats(data);
    } catch (_error) {
      // Stats are supplementary; the library itself still works.
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Fetch songs whenever the search, genre, sort or reload key changes.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const delay = filters.q ? 300 : 0;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const params = { sort: filters.sort };
        if (filters.q.trim()) params.q = filters.q.trim();
        if (filters.genre !== 'All') params.genre = filters.genre;

        const { data } = await api.get('/songs', { params, signal: controller.signal });
        if (!cancelled) setSongs(data.songs);
      } catch (requestError) {
        if (!cancelled && requestError.code !== 'ERR_CANCELED') {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [filters, reloadKey]);

  const pillCounts = useMemo(
    () => ({
      all: songs.length,
      favorites: songs.filter((song) => song.favorite).length,
      top: songs.filter((song) => song.rating >= 4).length,
    }),
    [songs]
  );

  // Quick filters narrow the already-loaded result set instantly.
  const visibleSongs = useMemo(() => {
    if (quick === 'favorites') return songs.filter((song) => song.favorite);
    if (quick === 'top') return songs.filter((song) => song.rating >= 4);
    return songs;
  }, [songs, quick]);

  const hasQueryFilters = Boolean(filters.q.trim()) || filters.genre !== 'All';
  const isFiltered = hasQueryFilters || quick !== 'all';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label || '';

  function openAdd() {
    setModal({ open: true, song: null });
  }

  function openEdit(song) {
    setModal({ open: true, song });
  }

  function closeModal() {
    setModal({ open: false, song: null });
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setQuick('all');
  }

  function removeFilter(patch) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  // Keyboard shortcuts: "/" focuses search, "n" adds a track.
  useEffect(() => {
    function onKeyDown(event) {
      if (modal.open || deleteTarget) return;

      const tag = event.target.tagName;
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openAdd();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal.open, deleteTarget]);

  async function handleSave(payload) {
    if (modal.song) {
      const { data } = await api.put(`/songs/${modal.song.id}`, payload);
      setSongs((current) =>
        current.map((song) => (song.id === data.song.id ? data.song : song))
      );
      toast.success('Track updated');
    } else {
      const { data } = await api.post('/songs', payload);
      setSongs((current) => [data.song, ...current]);
      toast.success('Track added to your library');
    }

    closeModal();
    refreshStats();

    // Refetch so the list stays correctly sorted and filtered after a change.
    setReloadKey((key) => key + 1);
  }

  async function handleToggleFavorite(song) {
    try {
      const { data } = await api.put(`/songs/${song.id}`, { favorite: !song.favorite });
      setSongs((current) => current.map((item) => (item.id === song.id ? data.song : item)));
      refreshStats();
    } catch (favoriteError) {
      toast.error(getErrorMessage(favoriteError));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await api.delete(`/songs/${deleteTarget.id}`);
      setSongs((current) => current.filter((song) => song.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.title}" was deleted`);
      setDeleteTarget(null);
      refreshStats();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  }

  function handleLogout() {
    logout();
    toast.info('Signed out. See you soon!');
    navigate('/login', { replace: true });
  }

  const sharedProps = {
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onToggleFavorite: handleToggleFavorite,
  };

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main">
        <section className="hero">
          <div className="hero__copy">
            <span className="eyebrow">
              <SparklesIcon size={14} /> {greeting()}, {firstName}
            </span>
            <h1>
              Your <span className="grad-text">soundtrack</span>,
              <br /> all in one place.
            </h1>
            <p className="hero__lead">
              Add the songs you love, rate them and keep your collection perfectly
              organised.
            </p>

            <div className="hero__actions">
              <button type="button" className="btn btn--primary" onClick={openAdd}>
                <PlusIcon size={18} /> Add track
                <kbd className="btn__kbd">N</kbd>
              </button>
              <span className="hero__pill">
                <ClockIcon size={16} />
                {stats ? formatTotalDuration(stats.totalDuration) : '...'} of music
              </span>
            </div>
          </div>

          <div className="hero__decor" aria-hidden="true">
            <div className="vinyl">
              <span className="vinyl__label" />
            </div>
            <span className="hero__note hero__note--1">&#9835;</span>
            <span className="hero__note hero__note--2">&#9834;</span>
            <span className="hero__note hero__note--3">&#9836;</span>
          </div>
        </section>

        <section className="stats" aria-label="Library statistics">
          <StatCard
            icon={<DiscIcon size={20} />}
            label="Tracks"
            value={<AnimatedNumber value={stats?.total} />}
            hint="in your library"
            tone="violet"
          />
          <StatCard
            icon={<HeadphonesIcon size={20} />}
            label="Artists"
            value={<AnimatedNumber value={stats?.artists} />}
            hint="unique artists"
            tone="blue"
          />
          <StatCard
            icon={<HeartIcon size={20} />}
            label="Favourites"
            value={<AnimatedNumber value={stats?.favorites} />}
            hint="loved tracks"
            tone="pink"
          />
          <StatCard
            icon={<StarIcon size={20} filled />}
            label="Avg rating"
            value={<AnimatedNumber value={stats?.avgRating} decimals={1} />}
            hint="out of 5"
            tone="gold"
          />
        </section>

        <section className="library">
          <div className="library__head">
            <div className="library__title">
              <h2>Your library</h2>
              <p aria-live="polite">
                {visibleSongs.length} {visibleSongs.length === 1 ? 'track' : 'tracks'}
                {isFiltered ? ' matching your filters' : ' in total'}
              </p>
            </div>

            <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}>
              <PlusIcon size={16} /> Add track
            </button>
          </div>

          <FilterPills value={quick} onChange={setQuick} counts={pillCounts} />

          <div className="toolbar">
            <div className="search">
              <SearchIcon size={17} className="search__icon" />
              <input
                ref={searchRef}
                type="search"
                className="search__input"
                placeholder="Search by title, artist or album..."
                value={filters.q}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, q: event.target.value }))
                }
                aria-label="Search tracks"
              />
              {filters.q ? (
                <button
                  type="button"
                  className="search__clear"
                  onClick={() => setFilters((current) => ({ ...current, q: '' }))}
                  aria-label="Clear search"
                >
                  <XIcon size={15} />
                </button>
              ) : (
                <kbd className="search__kbd" aria-hidden="true">
                  /
                </kbd>
              )}
            </div>

            <label className="select-wrap">
              <SlidersIcon size={15} />
              <select
                value={filters.genre}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, genre: event.target.value }))
                }
                aria-label="Filter by genre"
              >
                <option value="All">All genres</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <ChevronDownIcon size={14} />
            </label>

            <label className="select-wrap select-wrap--sort">
              <select
                value={filters.sort}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, sort: event.target.value }))
                }
                aria-label="Sort tracks"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon size={14} />
            </label>

            <div className="view-toggle" role="group" aria-label="Layout">
              <button
                type="button"
                className={`view-toggle__btn ${view === 'grid' ? 'is-active' : ''}`}
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
                title="Grid view"
              >
                <GridIcon size={16} />
              </button>
              <button
                type="button"
                className={`view-toggle__btn ${view === 'list' ? 'is-active' : ''}`}
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                aria-label="List view"
                title="List view"
              >
                <ListIcon size={16} />
              </button>
            </div>

            {loading && (
              <span className="toolbar__status spinner spinner--sm" role="status" aria-label="Updating" />
            )}
          </div>

          <ActiveFilters
            filters={filters}
            sortLabel={sortLabel}
            onRemove={removeFilter}
            onClearAll={clearFilters}
          />

          {loading && songs.length === 0 ? (
            <div className="song-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="song-skeleton" key={index}>
                  <div className="song-skeleton__cover" />
                  <div className="song-skeleton__line" />
                  <div className="song-skeleton__line song-skeleton__line--short" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty">
              <span className="empty__icon empty__icon--error">
                <AlertIcon size={30} />
              </span>
              <h3>Could not load your library</h3>
              <p>{error}</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          ) : visibleSongs.length === 0 ? (
            <EmptyState filtered={isFiltered} onAdd={openAdd} onClear={clearFilters} />
          ) : view === 'grid' ? (
            <div className={`song-grid ${loading ? 'is-updating' : ''}`}>
              {visibleSongs.map((song, index) => (
                <SongCard key={song.id} song={song} index={index} {...sharedProps} />
              ))}
            </div>
          ) : (
            <div className={`song-list ${loading ? 'is-updating' : ''}`}>
              <div className="song-list__head" aria-hidden="true">
                <span>Track</span>
                <span>Genre</span>
                <span>Year</span>
                <span>Length</span>
                <span>Rating</span>
                <span className="song-list__head-actions">Actions</span>
              </div>
              {visibleSongs.map((song, index) => (
                <SongRow key={song.id} song={song} index={index} {...sharedProps} />
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <span>Melody &middot; React + Node.js + Express + MongoDB</span>
        </footer>
      </main>

      <SongModal open={modal.open} song={modal.song} onClose={closeModal} onSave={handleSave} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this track?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" by ${deleteTarget.artist} will be permanently removed from your library.`
            : ''
        }
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
