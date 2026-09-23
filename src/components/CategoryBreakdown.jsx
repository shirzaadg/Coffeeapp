import { CATEGORIES, formatRating } from '../lib/ratings'

export default function CategoryBreakdown({ averages }) {
  return (
    <dl className="breakdown">
      {CATEGORIES.map((c) => (
        <div key={c.key} className="breakdown-item">
          <dt>{c.label}</dt>
          <dd>{formatRating(averages[c.key])}</dd>
        </div>
      ))}
    </dl>
  )
}
