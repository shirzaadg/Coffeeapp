import { formatRating, ratingColor } from '../lib/ratings'

export default function RatingBadge({ value, large = false }) {
  return (
    <span className={`rating-badge${large ? ' large' : ''}`} style={{ background: ratingColor(value) }}>
      {formatRating(value)}
    </span>
  )
}
