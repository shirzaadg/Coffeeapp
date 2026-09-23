import { useEffect, useRef } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { ErrorBanner, Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'
import { formatRating, ratingColor } from '../lib/ratings'

const WORLD = { center: [20, 0], zoom: 2 }

function FitToShops({ shops }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current || shops.length === 0) return
    fitted.current = true
    if (shops.length === 1) map.setView([shops[0].lat, shops[0].lng], 15)
    else map.fitBounds(shops.map((s) => [s.lat, s.lng]), { padding: [40, 40], maxZoom: 16 })
  }, [shops, map])
  return null
}

function pinRadius(average) {
  return average == null ? 7 : 6 + average * 2.4 // ~8px at 1★ → 18px at 5★
}

export default function MapPage() {
  const { shops, loading, error, reload } = useShops()
  const navigate = useNavigate()

  return (
    <div className="map-page">
      <MapContainer center={WORLD.center} zoom={WORLD.zoom} className="full-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Best-rated drawn last so they sit on top when pins overlap. */}
        {[...shops]
          .sort((a, b) => (a.average ?? 0) - (b.average ?? 0))
          .map((shop) => (
            <CircleMarker
              key={shop.id}
              center={[shop.lat, shop.lng]}
              radius={pinRadius(shop.average)}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: ratingColor(shop.average),
                fillOpacity: 0.9,
              }}
              eventHandlers={{ click: () => navigate(`/shops/${shop.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -pinRadius(shop.average)]}>
                {shop.name} · {formatRating(shop.average)}
              </Tooltip>
            </CircleMarker>
          ))}
        <FitToShops shops={shops} />
      </MapContainer>

      <div className="map-overlay">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={reload} />}
      </div>

      <div className="map-legend" aria-hidden="true">
        <span className="legend-dot" style={{ background: ratingColor(1), width: 10, height: 10 }} />
        <span>1★</span>
        <span className="legend-bar" />
        <span className="legend-dot" style={{ background: ratingColor(5), width: 18, height: 18 }} />
        <span>5★</span>
      </div>
    </div>
  )
}
