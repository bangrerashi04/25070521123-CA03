import { useEffect } from 'react';
import { AlertIcon, TrashIcon, XIcon } from './Icons';

export default function ConfirmDialog({
  open,
  title = 'Delete this track?',
  message = 'This action cannot be undone.',
  busy = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) onCancel();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        className="modal modal--sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="modal__head">
          <span className="confirm-icon">
            <AlertIcon size={22} />
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal__body">
          <h2 id="confirm-title">{title}</h2>
          <p className="confirm-text">{message}</p>
        </div>

        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? (
              <>
                <span className="spinner spinner--sm" /> Deleting...
              </>
            ) : (
              <>
                <TrashIcon size={16} /> Delete track
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
