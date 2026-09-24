import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import NewShopFields from '../components/NewShopFields'
import PageHeader from '../components/PageHeader'
import { EmptyState, Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'
import { deleteShop, updateShop } from '../lib/api'
import { validateNewShop } from '../lib/shops'

function EditShopForm({ shop }) {
  const { reload } = useShops()
  const navigate = useNavigate()
  const [fields, setFields] = useState({
    name: shop.name,
    address: shop.address ?? '',
    lat: shop.lat,
    lng: shop.lng,
    google_place_id: shop.google_place_id ?? null,
  })
  const [busy, setBusy] = useState(null) // 'save' | 'delete' | null
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validateNewShop(fields)
    if (problem) {
      setError(problem)
      return
    }
    setBusy('save')
    setError(null)
    try {
      await updateShop(shop.id, { ...fields, name: fields.name.trim(), address: fields.address.trim() })
      await reload()
      navigate(`/shops/${shop.id}`, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not save the shop')
      setBusy(null)
    }
  }

  async function handleDelete() {
    const visits = shop.visitCount
    const extra = visits ? ` and its ${visits} visit${visits === 1 ? '' : 's'}` : ''
    if (!window.confirm(`Delete ${shop.name}${extra}? This can’t be undone.`)) return
    setBusy('delete')
    setError(null)
    try {
      await deleteShop(shop)
      await reload()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not delete the shop')
      setBusy(null)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Edit shop" back={`/shops/${shop.id}`} />
      <form className="form" onSubmit={handleSubmit} noValidate>
        <NewShopFields value={fields} onChange={setFields} />
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy != null}>
          {busy === 'save' ? 'Saving…' : 'Save changes'}
        </button>
      </form>
      <div className="danger-zone">
        <button type="button" className="btn btn-danger btn-block" onClick={handleDelete} disabled={busy != null}>
          {busy === 'delete' ? 'Deleting…' : 'Delete shop'}
        </button>
      </div>
    </div>
  )
}

export default function EditShop() {
  const { id } = useParams()
  const { shops, loading } = useShops()
  const shop = shops.find((s) => s.id === id)

  if (loading) return <Spinner />
  if (!shop) {
    return (
      <div className="page">
        <PageHeader title="Edit shop" back="/" />
        <EmptyState title="Shop not found">
          <Link to="/" className="btn">
            Back to list
          </Link>
        </EmptyState>
      </div>
    )
  }
  return <EditShopForm key={shop.id} shop={shop} />
}
