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
