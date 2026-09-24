export const EMPTY_SHOP = { name: '', address: '', lat: null, lng: null, google_place_id: null }

export function validateNewShop(shop) {
  if (!shop.name.trim()) return 'Give the shop a name.'
  if (shop.lat == null) return 'Set the shop’s location: search for it or use your current location.'
  return null
}
