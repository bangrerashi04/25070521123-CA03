import { HeartIcon, SparklesIcon, MusicIcon } from './Icons';

export const QUICK_FILTERS = [
  { id: 'all', label: 'All tracks', icon: <MusicIcon size={14} /> },
  { id: 'favorites', label: 'Favourites', icon: <HeartIcon size={14} /> },
  { id: 'top', label: 'Top rated', icon: <SparklesIcon size={14} /> },
];

/** Quick, one-click filters above the library grid. */
export default function FilterPills({ value, onChange, counts = {} }) {
  return (
    <div className="pills" role="group" aria-label="Quick filters">
      {QUICK_FILTERS.map((filter) => {
        const active = value === filter.id;
        const count = counts[filter.id];

        return (
          <button
            key={filter.id}
            type="button"
            className={`pill ${active ? 'is-active' : ''}`}
            onClick={() => onChange(filter.id)}
            aria-pressed={active}
          >
            {filter.icon}
            {filter.label}
            {typeof count === 'number' && <span className="pill__count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
