import { createContext, useContext } from 'react'

export const ShopsContext = createContext(null)

export function useShops() {
  return useContext(ShopsContext)
}
