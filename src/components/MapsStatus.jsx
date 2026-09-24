import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import { useSyncExternalStore } from 'react'
import { getAuthFailed, subscribeAuthFailure } from '../lib/google'
import { ErrorBanner } from './Status'

/** Surfaces a rejected API key instead of leaving Google's generic "Oops" map. */
export default function MapsStatus() {
  const status = useApiLoadingStatus()
  const authFailed = useSyncExternalStore(subscribeAuthFailure, getAuthFailed)
  if (authFailed) {
    return (
      <ErrorBanner message="Google Maps rejected the API key. Check its website restrictions and that Maps JavaScript API and Places API (New) are enabled." />
    )
  }
  if (status === APILoadingStatus.FAILED) {
    return <ErrorBanner message="Google Maps couldn’t load. Check your connection." />
  }
  return null
}
