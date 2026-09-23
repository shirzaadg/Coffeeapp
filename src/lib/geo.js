// Nominatim usage policy: max 1 request/second and no search-as-you-type autocomplete,
// so address search runs only when the user submits it.
const NOMINATIM = 'https://nominatim.openstreetmap.org'

function lang() {
  return navigator.language || 'en'
}

/** "480 9th Street, Oakland" instead of Nominatim's full county/state/country string. */
function shortAddress(r) {
  const a = r.address
  if (!a) return r.display_name
  const street = [a.house_number, a.road].filter(Boolean).join(' ')
  const place = a.city || a.town || a.village || a.suburb || a.county
  return [street, place].filter(Boolean).join(', ') || r.display_name
}

export async function searchPlaces(query) {
  const params = new URLSearchParams({ q: query, format: 'jsonv2', limit: '6', addressdetails: '1', 'accept-language': lang() })
  const res = await fetch(`${NOMINATIM}/search?${params}`)
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  const results = await res.json()
  return results.map((r) => ({
    id: r.place_id,
    name: r.name || '',
    address: shortAddress(r),
    lat: Number(r.lat),
    lng: Number(r.lon),
  }))
}

/** Returns the address at a point, plus the café's name if the point is on one. */
export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({ lat, lon: lng, format: 'jsonv2', zoom: '18', addressdetails: '1', 'accept-language': lang() })
  const res = await fetch(`${NOMINATIM}/reverse?${params}`)
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`)
  const r = await res.json()
  return {
    address: r.error ? '' : shortAddress(r),
    cafeName: r.category === 'amenity' && r.type === 'cafe' ? r.name || '' : '',
  }
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not available on this device'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) =>
        reject(new Error(err.code === 1 ? 'Location permission was denied' : 'Could not get your location')),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  })
}
