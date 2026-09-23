export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="status" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">☕</div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
