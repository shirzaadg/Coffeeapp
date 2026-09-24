import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  ColorScheme,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MapsStatus from '../components/MapsStatus'
import { ErrorBanner, Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'
import { GOOGLE_MAP_ID } from '../lib/google'
import { formatRating, ratingColor } from '../lib/ratings'

const MAP_ID = 'shops-map'
const WORLD = { center: { lat: 20, lng: 0 }, zoom: 2 }

function FitToShops({ shops }) {
  const map = useMap(MAP_ID)
  const fitted = useRef(false)
  useEffect(() => {
    if (!map || fitted.current || shops.length === 0) return
    fitted.current = true
    if (shops.length === 1) {
      map.setCenter({ lat: shops[0].lat, lng: shops[0].lng })
      map.setZoom(15)
      return
    }
    const bounds = new google.maps.LatLngBounds()
    shops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }))
    map.fitBounds(bounds, 48)
    // Two shops on the same block would otherwise zoom in absurdly far.
    google.maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom() > 16) map.setZoom(16)
    })
  }, [map, shops])
  return null
}

function pinSize(average) {
  return average == null ? 14 : Math.round(12 + average * 4.8) // ~17px at 1★ → 36px at 5★
}

export default function MapPage() {
  const { shops, loading, error, reload } = useShops()
  const navigate = useNavigate()

  return (
    <div className="map-page">
      <GoogleMap
        id={MAP_ID}
        mapId={GOOGLE_MAP_ID}
        className="full-map"
        defaultCenter={WORLD.center}
        defaultZoom={WORLD.zoom}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        colorScheme={ColorScheme.FOLLOW_SYSTEM}
      >
        {shops.map((shop) => {
          const size = pinSize(shop.average)
          return (
            <AdvancedMarker
              key={shop.id}
              position={{ lat: shop.lat, lng: shop.lng }}
              anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
              title={`${shop.name} · ${formatRating(shop.average)}`}
              // Best-rated on top when pins overlap.
              zIndex={Math.round((shop.average ?? 0) * 10)}
              onClick={() => navigate(`/shops/${shop.id}`)}
            >
              <span
                className="shop-pin"
                style={{ width: size, height: size, background: ratingColor(shop.average) }}
              />
            </AdvancedMarker>
          )
        })}
        <FitToShops shops={shops} />
      </GoogleMap>

      <div className="map-overlay">
        <MapsStatus />
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={reload} />}
      </div>

      <div className="map-legend" aria-hidden="true">
        <span className="legend-dot" style={{ background: ratingColor(1), width: 12, height: 12 }} />
        <span>1★</span>
        <span className="legend-bar" />
        <span className="legend-dot" style={{ background: ratingColor(5), width: 20, height: 20 }} />
        <span>5★</span>
      </div>
    </div>
  )
}
