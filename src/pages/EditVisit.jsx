import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { EmptyState, Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'
import VisitForm from './VisitForm'

export default function EditVisit() {
  const { id } = useParams()
  const { shops, loading } = useShops()
  const visit = shops.flatMap((s) => s.visits).find((v) => v.id === id)

  if (loading) return <Spinner />
  if (!visit) {
    return (
      <div className="page">
        <PageHeader title="Edit visit" back="/" />
        <EmptyState title="Visit not found">
          <Link to="/" className="btn">
            Back to list
          </Link>
        </EmptyState>
      </div>
    )
  }
  return <VisitForm key={visit.id} existing={visit} />
}
