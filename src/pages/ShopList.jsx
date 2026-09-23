import { Link } from 'react-router-dom'
import CategoryBreakdown from '../components/CategoryBreakdown'
import PageHeader from '../components/PageHeader'
import RatingBadge from '../components/RatingBadge'
import StarRating from '../components/StarRating'
import { EmptyState, ErrorBanner, Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'

function byRating(a, b) {
  if (a.average == null && b.average == null) return a.name.localeCompare(b.name)
  if (a.average == null) return 1
  if (b.average == null) return -1
  return b.average - a.average || b.visitCount - a.visitCount
}

export default function ShopList() {
  const { shops, loading, error, reload } = useShops()
  const sorted = [...shops].sort(byRating)

  return (
    <div className="page">
      <PageHeader
        title="Coffee shops"
        action={
          <Link to="/shops/new" className="btn btn-small">
            + Shop
          </Link>
        }
      />
      {error && <ErrorBanner message={error} onRetry={reload} />}
      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        !error && (
          <EmptyState title="No shops yet">
            <p>Log your first visit and it’ll show up here.</p>
            <Link to="/visits/new" className="btn btn-primary">
              Log a visit
            </Link>
          </EmptyState>
        )
      ) : (
        <ul className="shop-list">
          {sorted.map((shop) => (
            <li key={shop.id}>
              <Link to={`/shops/${shop.id}`} className="card shop-card">
                <div className="shop-card-head">
                  <div className="shop-card-title">
                    <h2>{shop.name}</h2>
                    {shop.address && <p className="muted small truncate">{shop.address}</p>}
                  </div>
                  <RatingBadge value={shop.average} />
                </div>
                <div className="shop-card-meta">
                  <StarRating value={shop.average} size="sm" />
                  <span className="muted small">
                    {shop.visitCount} visit{shop.visitCount === 1 ? '' : 's'}
                  </span>
                </div>
                {shop.visitCount > 0 && <CategoryBreakdown averages={shop.categories} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
