import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const pinIcon = L.divIcon({
  className: 'pin-icon',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

function Recenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 16))
  }, [lat, lng, map])
  return null
}

function TapToMove({ onMove }) {
  useMapEvents({ click: (e) => onMove(e.latlng) })
  return null
}

/** Small map with a pin the user can drag (or tap to move) to fine-tune a shop's location. */
export default function LocationMap({ lat, lng, onMove }) {
  return (
    <MapContainer center={[lat, lng]} zoom={17} className="location-map" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        icon={pinIcon}
        draggable
        eventHandlers={{ dragend: (e) => onMove(e.target.getLatLng()) }}
      />
      <Recenter lat={lat} lng={lng} />
      <TapToMove onMove={onMove} />
    </MapContainer>
  )
}
