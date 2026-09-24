export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// Required for AdvancedMarker (custom pin styling); create one under Maps Platform → Map management.
export const GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID

export const isGoogleConfigured = Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAP_ID)

/** Link that opens the shop in the Google Maps app / site. */
export function googleMapsUrl(shop) {
  const params = new URLSearchParams({ api: '1', query: shop.google_place_id ? shop.name : `${shop.lat},${shop.lng}` })
  if (shop.google_place_id) params.set('query_place_id', shop.google_place_id)
  return `https://www.google.com/maps/search/?${params}`
}
