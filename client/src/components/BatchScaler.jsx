// Controls for the batch scaler: how many drinks (×1 ... ×8) and which unit (ml / oz).
// The parent page owns the values and recalculates the measures.
export const MULTIPLIERS = [1, 2, 4, 8];

export default function BatchScaler({ multiplier, unit, onMultiplierChange, onUnitChange }) {
  return (
    <div className="scaler">
      <div className="segmented" role="group" aria-label="Number of drinks">
        {MULTIPLIERS.map((m) => (
          <button
            key={m}
            type="button"
            className={m === multiplier ? 'active' : ''}
            aria-pressed={m === multiplier}
            onClick={() => onMultiplierChange(m)}
          >
            ×{m}
          </button>
        ))}
      </div>

      <div className="segmented" role="group" aria-label="Measurement unit">
        {['ml', 'oz'].map((u) => (
          <button
            key={u}
            type="button"
            className={u === unit ? 'active' : ''}
            aria-pressed={u === unit}
            onClick={() => onUnitChange(u)}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
