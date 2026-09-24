import { AdvancedMarker, ColorScheme, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { GOOGLE_MAP_ID } from '../lib/google'

function Recenter({ lat, lng }) {
  const map = useMap('location-map')
  useEffect(() => {
    map?.panTo({ lat, lng })
  }, [lat, lng, map])
  return null
}

/** Small map with a pin the user can drag (or tap to move) to fine-tune a shop's location. */
export default function LocationMap({ lat, lng, onMove }) {
  return (
    <div className="location-map">
      <GoogleMap
        id="location-map"
        mapId={GOOGLE_MAP_ID}
        defaultCenter={{ lat, lng }}
        defaultZoom={18}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        colorScheme={ColorScheme.FOLLOW_SYSTEM}
        onClick={(e) => e.detail.latLng && onMove(e.detail.latLng)}
      >
        <AdvancedMarker
          position={{ lat, lng }}
          draggable
          onDragEnd={(e) => e.latLng && onMove({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
        >
          <span className="drop-pin" />
        </AdvancedMarker>
        <Recenter lat={lat} lng={lng} />
      </GoogleMap>
    </div>
  )
}
