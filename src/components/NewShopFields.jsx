import { useState } from 'react'
import { getCurrentPosition, reverseGeocode, searchPlaces } from '../lib/geo'
import LocationMap from './LocationMap'

/**
 * Name + location fields for a new shop. `onChange` must be a React state setter
 * (it's called with updater functions so async lookups never clobber typing).
 */
export default function NewShopFields({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [busy, setBusy] = useState(null) // 'search' | 'locate' | null
  const [message, setMessage] = useState(null)

  const patch = (p) => onChange((prev) => ({ ...prev, ...p }))

  async function runSearch() {
    const q = query.trim()
    if (q.length < 3 || busy) return
    setBusy('search')
    setMessage(null)
    try {
      const found = await searchPlaces(q)
      setResults(found)
      if (!found.length) setMessage('No matches. Try adding the street or city.')
    } catch {
      setMessage('Search failed. Check your connection and try again.')
    } finally {
      setBusy(null)
    }
  }

  function pick(place) {
    onChange((prev) => ({
      ...prev,
      name: prev.name || place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
    }))
    setResults(null)
    setQuery('')
  }

  async function useMyLocation() {
    setBusy('locate')
    setMessage(null)
    setResults(null)
    try {
      const pos = await getCurrentPosition()
      patch(pos)
      try {
        const place = await reverseGeocode(pos.lat, pos.lng)
        onChange((prev) => ({ ...prev, address: place.address, name: prev.name || place.cafeName }))
      } catch {
        // Pin is set; the address is optional, so a failed lookup isn't worth surfacing.
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="new-shop">
      <label className="field">
        <span className="field-label">Shop name</span>
        <input
          value={value.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. Blue Bottle"
          autoComplete="off"
        />
      </label>

      <div className="field">
        <span className="field-label">Location</span>
        <div className="search-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                runSearch()
              }
            }}
            placeholder="Search address or place"
            enterKeyHint="search"
            aria-label="Search address or place"
          />
          <button type="button" className="btn" onClick={runSearch} disabled={busy != null || query.trim().length < 3}>
            {busy === 'search' ? '…' : 'Search'}
          </button>
        </div>

        {results?.length > 0 && (
          <ul className="search-results">
            {results.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => pick(r)}>
                  {r.name && <strong>{r.name}</strong>}
                  <span>{r.address}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="btn btn-ghost locate-btn" onClick={useMyLocation} disabled={busy != null}>
          {busy === 'locate' ? 'Finding you…' : '📍 Use my current location'}
        </button>

        {message && <p className="field-hint error-text">{message}</p>}
      </div>

      {value.lat != null && (
        <div className="field">
          <LocationMap lat={value.lat} lng={value.lng} onMove={({ lat, lng }) => patch({ lat, lng })} />
          <p className="field-hint">Drag the pin or tap the map to adjust.</p>
          <label className="field">
            <span className="field-label">Address</span>
            <input
              value={value.address}
              onChange={(e) => patch({ address: e.target.value })}
              placeholder="Optional"
            />
          </label>
        </div>
      )}
    </div>
  )
}
