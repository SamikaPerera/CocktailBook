// A simple "Are you sure?" pop-up, used before deleting a spec.
// It's only shown when `open` is true; the parent decides what happens
// on confirm / cancel.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  busy = false,
  onConfirm,
  onCancel,
}) {
  // Let the Escape key close the dialog (good for keyboard users).
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey); // clean up
  }, [open, busy, onCancel]);

  if (!open) return null;

  // createPortal draws the dialog straight into <body>, so it always covers
  // the whole screen, whatever page layout it was opened from.
  return createPortal(
    // Clicking the dark backdrop also cancels.
    <div className="dialog-backdrop" onClick={busy ? undefined : onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()} // clicks inside don't close it
      >
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
