import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import { ErrorBanner } from './Status'

/** Surfaces a bad/restricted API key instead of leaving a blank grey map. */
export default function MapsStatus() {
  const status = useApiLoadingStatus()
  if (status === APILoadingStatus.AUTH_FAILURE) {
    return <ErrorBanner message="Google Maps rejected the API key. Check the key and its website restrictions." />
  }
  if (status === APILoadingStatus.FAILED) {
    return <ErrorBanner message="Google Maps couldn’t load. Check your connection." />
  }
  return null
}
