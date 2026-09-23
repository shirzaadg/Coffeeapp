import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewShopFields from '../components/NewShopFields'
import PageHeader from '../components/PageHeader'
import { useShops } from '../data/shopsContext'
import { EMPTY_SHOP, validateNewShop } from '../lib/shops'
import { createShop } from '../lib/api'

export default function AddShop() {
  const { reload } = useShops()
  const navigate = useNavigate()
  const [shop, setShop] = useState(EMPTY_SHOP)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validateNewShop(shop)
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await createShop({ ...shop, name: shop.name.trim(), address: shop.address.trim() })
      await reload()
      navigate(`/shops/${created.id}`, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not save the shop')
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Add a shop" back="/" />
      <form className="form" onSubmit={handleSubmit} noValidate>
        <NewShopFields value={shop} onChange={setShop} />
        {error && <p className="error-text" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Saving…' : 'Save shop'}
        </button>
      </form>
    </div>
  )
}
