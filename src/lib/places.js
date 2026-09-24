// Google Places API (New) helpers. Each takes the `places` library from useMapsLibrary('places').

const PLACE_FIELDS = ['id', 'displayName', 'formattedAddress', 'shortFormattedAddress', 'location']

function toShopFields(place) {
  return {
    google_place_id: place.id,
    name: place.displayName ?? '',
    address: place.shortFormattedAddress || place.formattedAddress || '',
    lat: place.location.lat(),
    lng: place.location.lng(),
  }
}

export async function autocomplete(places, input, sessionToken, near) {
  const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
    ...(near && { locationBias: { center: near, radius: 20000 } }),
  })
  return suggestions
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((p) => ({
      id: p.placeId,
      main: p.mainText?.text ?? p.text.text,
      secondary: p.secondaryText?.text ?? '',
      prediction: p,
    }))
}

/** Resolve a suggestion to shop fields. Ends the autocomplete billing session. */
export async function placeFromSuggestion(suggestion) {
  const place = suggestion.prediction.toPlace()
  await place.fetchFields({ fields: PLACE_FIELDS })
  return toShopFields(place)
}

/** Cafés within ~150 m, nearest first — for "I'm standing in it" logging. */
export async function cafesNear(places, center) {
  const { places: found } = await places.Place.searchNearby({
    fields: PLACE_FIELDS,
    locationRestriction: { center, radius: 150 },
    includedTypes: ['cafe', 'coffee_shop'],
    maxResultCount: 8,
    rankPreference: places.SearchNearbyRankPreference.DISTANCE,
  })
  return found.map(toShopFields)
}
