import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NewShopFields from '../components/NewShopFields'
import PageHeader from '../components/PageHeader'
import StarRating from '../components/StarRating'
import { Spinner } from '../components/Status'
import { useShops } from '../data/shopsContext'
import { createShop, createVisit, uploadPhoto } from '../lib/api'
import { todayISO } from '../lib/dates'
import { EMPTY_SHOP, validateNewShop } from '../lib/shops'
import { CATEGORIES, formatRating } from '../lib/ratings'

const NEW_SHOP = '__new'
const NAME_KEY = 'coffee.visitorName'

function readSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveName(name) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    // Private mode etc. — remembering the name is just a convenience.
  }
}

const EMPTY_RATINGS = Object.fromEntries(CATEGORIES.map((c) => [c.key, null]))

export default function LogVisit() {
  const { shops, loading, reload } = useShops()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [shopChoice, setShopChoice] = useState(params.get('shop') ?? '')
  const [newShop, setNewShop] = useState(EMPTY_SHOP)
  const [visitorName, setVisitorName] = useState(readSavedName)
  const [visitDate, setVisitDate] = useState(todayISO)
  const [drink, setDrink] = useState('')
  const [notes, setNotes] = useState('')
  const [ratings, setRatings] = useState(EMPTY_RATINGS)
  const [photo, setPhoto] = useState(null) // { file, previewUrl }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // With no shops yet, the only option is adding one.
  const shopId = !loading && shops.length === 0 ? NEW_SHOP : shopChoice
  const sortedShops = useMemo(() => [...shops].sort((a, b) => a.name.localeCompare(b.name)), [shops])
  const knownNames = useMemo(
    () => [...new Set(shops.flatMap((s) => s.visits.map((v) => v.visitor_name)))].sort(),
    [shops],
  )

  function choosePhoto(file) {
    if (photo) URL.revokeObjectURL(photo.previewUrl)
    setPhoto(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
  }

  function validate() {
    if (!shopId) return 'Pick a shop.'
    if (shopId === NEW_SHOP) {
      const problem = validateNewShop(newShop)
      if (problem) return problem
    }
    if (!visitorName.trim()) return 'Who’s visiting? Add a name.'
    if (!visitDate) return 'Add the visit date.'
    const missing = CATEGORIES.filter((c) => c.required && ratings[c.key] == null).map((c) => c.label)
    if (missing.length) return `Rate ${missing.join(' and ')}.`
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError(null)
    try {
      let id = shopId
      if (id === NEW_SHOP) {
        const created = await createShop({
          ...newShop,
          name: newShop.name.trim(),
          address: newShop.address.trim(),
        })
        id = created.id
        // If a later step fails, a retry should reuse this shop rather than create a duplicate.
        setShopChoice(id)
        setNewShop(EMPTY_SHOP)
      }
      const photoUrl = photo ? await uploadPhoto(id, photo.file) : null
      await createVisit({
        shop_id: id,
        visitor_name: visitorName.trim(),
        visit_date: visitDate,
        drink_ordered: drink.trim() || null,
        notes: notes.trim() || null,
        photo_url: photoUrl,
        ...ratings,
      })
      saveName(visitorName.trim())
      await reload()
      navigate(`/shops/${id}`, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not save the visit')
      setSaving(false)
      reload()
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <PageHeader title="Log a visit" />
      <form className="form" onSubmit={handleSubmit} noValidate>
        {shops.length > 0 && (
          <label className="field">
            <span className="field-label">Shop</span>
            <select value={shopId} onChange={(e) => setShopChoice(e.target.value)}>
              <option value="" disabled>
                Choose a shop…
              </option>
              {sortedShops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value={NEW_SHOP}>+ Add a new shop</option>
            </select>
          </label>
        )}

        {shopId === NEW_SHOP && (
          <section className="card inset" aria-labelledby="new-shop-title">
            <h2 id="new-shop-title">New shop</h2>
            <NewShopFields value={newShop} onChange={setNewShop} />
          </section>
        )}

        <div className="field-row">
          <label className="field">
            <span className="field-label">Your name</span>
            <input
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              list="visitor-names"
              autoComplete="given-name"
            />
            <datalist id="visitor-names">
              {knownNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" value={visitDate} max={todayISO()} onChange={(e) => setVisitDate(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Drink ordered</span>
          <input value={drink} onChange={(e) => setDrink(e.target.value)} placeholder="e.g. Oat flat white" />
        </label>

        <fieldset className="ratings">
          <legend className="field-label">Ratings</legend>
          {CATEGORIES.map((c) => (
            <div key={c.key} className="rating-row">
              <span className="rating-label">
                {c.label}
                {!c.required && <span className="muted small"> (optional)</span>}
              </span>
              <StarRating
                value={ratings[c.key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [c.key]: v }))}
                label={`${c.label} rating`}
              />
              <span className="rating-value">{formatRating(ratings[c.key])}</span>
            </div>
          ))}
          <p className="field-hint">Tap the left half of a star for a half star. Tap again to clear.</p>
        </fieldset>

        <label className="field">
          <span className="field-label">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything worth remembering" />
        </label>

        <div className="field">
          <span className="field-label">Photo</span>
          {photo ? (
            <div className="photo-preview">
              <img src={photo.previewUrl} alt="Selected" />
              <button type="button" className="btn btn-small" onClick={() => choosePhoto(null)}>
                Remove
              </button>
            </div>
          ) : (
            <label className="btn btn-ghost file-btn">
              📷 Add a photo
              <input type="file" accept="image/*" onChange={(e) => choosePhoto(e.target.files?.[0] ?? null)} hidden />
            </label>
          )}
        </div>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Saving…' : 'Save visit'}
        </button>
      </form>
    </div>
  )
}
