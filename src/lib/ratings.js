// Overall ratings are always derived here, never stored in the database.

export const CATEGORIES = [
  { key: 'rating_coffee', label: 'Coffee', required: true },
  { key: 'rating_atmosphere', label: 'Atmosphere', required: true },
  { key: 'rating_food', label: 'Food', required: false },
  { key: 'rating_service', label: 'Service', required: false },
]

function mean(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
}

function present(values) {
  return values.filter((v) => v != null).map(Number)
}

/** Average of whichever category ratings the visit has. */
export function visitOverall(visit) {
  return mean(present(CATEGORIES.map((c) => visit[c.key])))
}

/** Average of the shop's per-visit overall ratings. */
export function shopAverage(visits) {
  return mean(present(visits.map(visitOverall)))
}

export function categoryAverages(visits) {
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.key, mean(present(visits.map((v) => v[c.key])))]),
  )
}

export function formatRating(value) {
  return value == null ? '–' : value.toFixed(1)
}

/** Red (1★) → amber → green (5★); grey when unrated. Shared by list badges and map pins. */
export function ratingColor(value) {
  if (value == null) return '#9a8f86'
  const t = Math.min(Math.max((value - 1) / 4, 0), 1)
  return `hsl(${Math.round(t * 120)} 60% 40%)`
}
