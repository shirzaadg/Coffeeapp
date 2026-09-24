import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useEffect, useRef, useState } from 'react'
import { getCurrentPosition } from '../lib/geo'
import { autocomplete, cafesNear, placeFromSuggestion } from '../lib/places'
import LocationMap from './LocationMap'
import MapsStatus from './MapsStatus'

/**
 * Name + location fields for a new shop, backed by Google Places. `onChange` must be a
 * React state setter (it's called with updater functions so async lookups never clobber typing).
 */
export default function NewShopFields({ value, onChange }) {
  const places = useMapsLibrary('places')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [nearby, setNearby] = useState(null) // { position, cafes } after "use my location"
  const [near, setNear] = useState(null) // last known position; biases search results
  const [busy, setBusy] = useState(null) // 'pick' | 'locate' | null
  const [message, setMessage] = useState(null)
  const sessionRef = useRef(null)
  const requestRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const patch = (p) => onChange((prev) => ({ ...prev, ...p }))

  function handleQueryChange(text) {
    setQuery(text)
    setMessage(null)
    clearTimeout(timerRef.current)
    const requestId = ++requestRef.current
    const q = text.trim()
    if (!places || q.length < 2) {
      setSuggestions([])
      return
    }
    timerRef.current = setTimeout(async () => {
      // One session token per search → pick cycle keeps autocomplete billing to a single session.
      sessionRef.current ??= new places.AutocompleteSessionToken()
      try {
        const results = await autocomplete(places, q, sessionRef.current, near)
        if (requestId !== requestRef.current) return
        setSuggestions(results)
        if (!results.length) setMessage('No matches on Google Maps.')
      } catch {
        if (requestId === requestRef.current) setMessage('Search failed. Check your connection and try again.')
      }
    }, 250)
  }

  function choosePlace(shop) {
    onChange((prev) => ({ ...prev, ...shop, name: shop.name || prev.name }))
    setNearby(null)
    setSuggestions([])
    setQuery('')
    setMessage(null)
  }

  async function pick(suggestion) {
    requestRef.current++
    setBusy('pick')
    setSuggestions([])
    setQuery(suggestion.main)
    try {
      choosePlace(await placeFromSuggestion(suggestion))
    } catch {
      setMessage('Couldn’t load that place. Try again.')
    } finally {
      sessionRef.current = null
      setBusy(null)
    }
  }

  function dropPinAt(pos) {
    onChange((prev) => ({ ...prev, lat: pos.lat, lng: pos.lng, google_place_id: null }))
    setNearby(null)
  }

  async function locateMe() {
    setBusy('locate')
    setMessage(null)
    setSuggestions([])
    try {
      const pos = await getCurrentPosition()
      setNear(pos)
      let cafes = []
      try {
        cafes = places ? await cafesNear(places, pos) : []
      } catch {
        // Fall through to a plain pin at the user's position.
      }
      if (cafes.length) {
        setNearby({ position: pos, cafes })
      } else {
        dropPinAt(pos)
        setMessage('No cafés found right here, so we dropped a pin where you are. Type the shop name below.')
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="new-shop">
      <MapsStatus />
      <div className="field">
        <span className="field-label">Find the café</span>
        <div className="search-box">
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (suggestions[0]) pick(suggestions[0])
              }
            }}
            placeholder={busy === 'pick' ? 'Loading…' : 'Search Google Maps'}
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Search Google Maps for the café"
            disabled={busy === 'pick'}
          />
          {suggestions.length > 0 && (
            <ul className="search-results">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => pick(s)}>
                    <strong>{s.main}</strong>
                    {s.secondary && <span>{s.secondary}</span>}
                  </button>
                </li>
              ))}
              <li className="attribution">Results from Google Maps</li>
            </ul>
          )}
        </div>

        <button type="button" className="btn btn-ghost locate-btn" onClick={locateMe} disabled={busy != null}>
          {busy === 'locate' ? 'Finding you…' : '📍 I’m here now: use my location'}
        </button>

        {nearby && (
          <div className="nearby">
            <p className="field-label">Which café are you in?</p>
            <ul className="search-results">
              {nearby.cafes.map((c) => (
                <li key={c.google_place_id}>
                  <button type="button" onClick={() => choosePlace(c)}>
                    <strong>{c.name}</strong>
                    {c.address && <span>{c.address}</span>}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => dropPinAt(nearby.position)}>
                  <strong>Not listed</strong>
                  <span>Drop a pin where I am and type the name myself</span>
                </button>
              </li>
              <li className="attribution">Results from Google Maps</li>
            </ul>
          </div>
        )}

        {message && <p className="field-hint">{message}</p>}
      </div>

      <label className="field">
        <span className="field-label">Shop name</span>
        <input
          value={value.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Filled in when you pick a café"
          autoComplete="off"
        />
      </label>

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
