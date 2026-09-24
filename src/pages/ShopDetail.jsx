import { Link, useParams } from 'react-router-dom'
import CategoryBreakdown from '../components/CategoryBreakdown'
import PageHeader from '../components/PageHeader'
import RatingBadge from '../components/RatingBadge'
import StarRating from '../components/StarRating'
import { EmptyState, ErrorBanner, Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'
import { formatDate } from '../lib/dates'
import { googleMapsUrl } from '../lib/google'
import { CATEGORIES, formatRating, visitOverall } from '../lib/ratings'

function newestFirst(a, b) {
  return b.visit_date.localeCompare(a.visit_date) || b.created_at.localeCompare(a.created_at)
}

function VisitCard({ visit }) {
  return (
    <article className="card visit-card">
      <header className="visit-head">
        <div>
          <h3>{visit.visitor_name}</h3>
          <p className="muted small">
            {formatDate(visit.visit_date)}
            {visit.drink_ordered && <> · {visit.drink_ordered}</>}
          </p>
        </div>
        <RatingBadge value={visitOverall(visit)} />
      </header>
      <dl className="visit-ratings">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="visit-rating-row">
            <dt>{c.label}</dt>
            <dd>
              {visit[c.key] == null ? (
                <span className="muted small">skipped</span>
              ) : (
                <>
                  <StarRating value={Number(visit[c.key])} size="sm" />
                  <span className="small">{formatRating(Number(visit[c.key]))}</span>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {visit.notes && <p className="visit-notes">{visit.notes}</p>}
      {visit.photo_url && (
        <a href={visit.photo_url} target="_blank" rel="noreferrer" className="visit-photo">
          <img src={visit.photo_url} alt={`Photo from ${visit.visitor_name}’s visit`} loading="lazy" />
        </a>
      )}
    </article>
  )
}

export default function ShopDetail() {
  const { id } = useParams()
  const { shops, loading, error, reload } = useShops()
  const shop = shops.find((s) => s.id === id)

  if (loading) return <Spinner />
  if (!shop) {
    return (
      <div className="page">
        <PageHeader title="Shop" back="/" />
        {error ? (
          <ErrorBanner message={error} onRetry={reload} />
        ) : (
          <EmptyState title="Shop not found">
            <Link to="/" className="btn">
              Back to list
            </Link>
          </EmptyState>
        )}
      </div>
    )
  }

  const visits = [...shop.visits].sort(newestFirst)

  return (
    <div className="page">
      <PageHeader title={shop.name} back="/" />
      <section className="card shop-summary">
        {shop.address && <p className="muted small">{shop.address}</p>}
        <div className="shop-summary-rating">
          <RatingBadge value={shop.average} large />
          <div>
            <StarRating value={shop.average} />
            <p className="muted small">
              {shop.visitCount} visit{shop.visitCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        {shop.visitCount > 0 && <CategoryBreakdown averages={shop.categories} />}
        <div className="button-row">
          <Link to={`/visits/new?shop=${shop.id}`} className="btn btn-primary">
            Log a visit here
          </Link>
          <a href={googleMapsUrl(shop)} target="_blank" rel="noreferrer" className="btn">
            Google Maps ↗
          </a>
        </div>
      </section>

      <h2 className="section-title">Visits</h2>
      {visits.length === 0 ? (
        <p className="muted">No visits logged yet.</p>
      ) : (
        <div className="visit-list">
          {visits.map((v) => (
            <VisitCard key={v.id} visit={v} />
          ))}
        </div>
      )}
    </div>
  )
}
