import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchShops } from '../lib/api'
import { categoryAverages, shopAverage } from '../lib/ratings'
import { ShopsContext } from './shopsContext'

function enrich(shop) {
  return {
    ...shop,
    average: shopAverage(shop.visits),
    categories: categoryAverages(shop.visits),
    visitCount: shop.visits.length,
  }
}

/**
 * Loads every shop with its visits in one query and shares it across pages.
 * The dataset is two people's coffee habit, so fetching everything is fine.
 */
export default function ShopsProvider({ children }) {
  const [shops, setShops] = useState(null)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      const data = await fetchShops()
      setShops(data.map(enrich))
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load shops')
    }
  }, [])

  useEffect(() => {
    // State is only set after the fetch resolves, not synchronously.
    // oxlint-disable-next-line react/set-state-in-effect
    reload()
  }, [reload])

  const value = useMemo(
    () => ({ shops: shops ?? [], loading: shops === null && !error, error, reload }),
    [shops, error, reload],
  )

  return <ShopsContext.Provider value={value}>{children}</ShopsContext.Provider>
}
