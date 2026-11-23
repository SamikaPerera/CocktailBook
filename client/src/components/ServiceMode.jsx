// Service mode: a full-screen, high-contrast view of one spec with very large
// text, readable at arm's length behind a busy bar. While it's open, the
// screen is kept switched on (useWakeLock).
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { scaleMeasure } from '../utils/scaleMeasure.js';

const STATUS_TEXT = {
  on: '● Screen will stay on',
  off: 'Turning screen lock on…',
  unsupported: 'This browser cannot keep the screen on',
  error: 'Could not keep the screen on (battery saver?)',
};

export default function ServiceMode({ spec, multiplier, unit, onClose }) {
  const { status, request, release } = useWakeLock();

  // Keep the screen on while service mode is open; Escape closes it.
  useEffect(() => {
    request();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      release();
      window.removeEventListener('keydown', onKey);
    };
  }, [request, release, onClose]);

  // createPortal draws this straight into <body>, outside the page layout.
  // (Inside the frosted-glass card, "position: fixed" would only cover the card.)
  return createPortal(
    <div className="service-mode" role="dialog" aria-modal="true" aria-label={`Service mode: ${spec.name}`}>
      <div className="service-top">
        <span className={`service-status ${status === 'on' ? 'on' : ''}`}>{STATUS_TEXT[status]}</span>
        <button type="button" className="btn service-exit" onClick={onClose} autoFocus>Exit</button>
      </div>

      <h1>{spec.name}{multiplier > 1 && ` ×${multiplier}`}</h1>

      <dl className="service-facts">
        <div><dt>Glass</dt><dd>{spec.glass}</dd></div>
        <div><dt>Ice</dt><dd>{spec.ice}</dd></div>
        <div><dt>Garnish</dt><dd>{spec.garnish}</dd></div>
      </dl>

      <table className="service-ingredients">
        <tbody>
          {spec.ingredients.map((ing, index) => (
            <tr key={`${ing.name}-${index}`}>
              <td className="measure">{scaleMeasure(ing.measure, multiplier, unit)}</td>
              <td>{ing.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="service-method">{spec.method}</p>
    </div>,
    document.body,
  );
}
