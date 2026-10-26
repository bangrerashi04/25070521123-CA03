import { XIcon } from './Icons';

/**
 * Removable chips that summarise every active filter.
 */
export default function ActiveFilters({ filters, sortLabel, onRemove, onClearAll }) {
  const chips = [];

  if (filters.q.trim()) {
    chips.push({ key: 'q', label: `"${filters.q.trim()}"`, clear: { q: '' } });
  }

  if (filters.genre !== 'All') {
    chips.push({ key: 'genre', label: filters.genre, clear: { genre: 'All' } });
  }

  if (filters.sort !== 'newest') {
    chips.push({ key: 'sort', label: sortLabel, clear: { sort: 'newest' } });
  }

  if (chips.length === 0) return null;

  return (
    <div className="active-filters" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="filter-chip"
          onClick={() => onRemove(chip.clear)}
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <XIcon size={12} />
        </button>
      ))}

      <button type="button" className="filter-chip filter-chip--clear" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
