/** Today as YYYY-MM-DD in the device's local timezone. */
export function todayISO() {
  return new Date().toLocaleDateString('en-CA')
}

/** Format a Postgres `date` (YYYY-MM-DD) without shifting it through UTC. */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
