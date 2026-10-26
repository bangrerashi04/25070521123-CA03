import { MusicIcon, SearchIcon } from './Icons';

export default function EmptyState({ filtered, onAdd, onClear }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        {filtered ? <SearchIcon size={30} /> : <MusicIcon size={30} />}
      </span>
      <h3>{filtered ? 'No tracks match your filters' : 'Your library is empty'}</h3>
      <p>
        {filtered
          ? 'Try a different search term, genre or sort order.'
          : 'Add the first song you love and start building your collection.'}
      </p>
      {filtered ? (
        <button type="button" className="btn btn--ghost" onClick={onClear}>
          Clear filters
        </button>
      ) : (
        <button type="button" className="btn btn--primary" onClick={onAdd}>
          Add your first track
        </button>
      )}
    </div>
  );
}
