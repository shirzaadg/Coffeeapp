import { formatRating } from '../lib/ratings'

/**
 * Half-star rating display, or input when `onChange` is passed.
 * Each star has two tap zones (left = x.5, right = x.0); tapping the current value clears it.
 */
export default function StarRating({ value, onChange, size = 'md', label }) {
  const interactive = Boolean(onChange)
  return (
    <div
      className={`stars stars-${size}${interactive ? ' stars-input' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? label : `${formatRating(value)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = value == null ? 0 : Math.min(Math.max(value - (i - 1), 0), 1)
        return (
          <span key={i} className="star" aria-hidden={!interactive}>
            <span className="star-bg">★</span>
            <span className="star-fg" style={{ width: `${fill * 100}%` }}>
              ★
            </span>
            {interactive &&
              [i - 0.5, i].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`star-hit ${v % 1 ? 'left' : 'right'}`}
                  role="radio"
                  aria-checked={value === v}
                  aria-label={`${v} star${v === 1 ? '' : 's'}`}
                  onClick={() => onChange(value === v ? null : v)}
                />
              ))}
          </span>
        )
      })}
    </div>
  )
}
