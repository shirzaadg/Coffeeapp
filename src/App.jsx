import { useEffect, useRef } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import ShopsProvider from './data/ShopsProvider'
import { isSupabaseConfigured } from './lib/supabase'
import AddShop from './pages/AddShop'
import LogVisit from './pages/LogVisit'
import MapPage from './pages/MapPage'
import ShopDetail from './pages/ShopDetail'
import ShopList from './pages/ShopList'

function SetupNotice() {
  return (
    <div className="page setup">
      <h1>Almost there</h1>
      <p>
        Supabase isn’t configured. Copy <code>.env.example</code> to <code>.env</code>, fill in{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
      </p>
    </div>
  )
}

/** The scroll container is <main>, not the window, so reset it on navigation. */
function Main({ children }) {
  const ref = useRef(null)
  const { pathname } = useLocation()
  useEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, [pathname])
  return (
    <main className="app-main" ref={ref}>
      {children}
    </main>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <BrowserRouter>
      <ShopsProvider>
        <div className="app">
          <Main>
            <Routes>
              <Route path="/" element={<ShopList />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/shops/new" element={<AddShop />} />
              <Route path="/shops/:id" element={<ShopDetail />} />
              <Route path="/visits/new" element={<LogVisit />} />
              <Route path="*" element={<ShopList />} />
            </Routes>
          </Main>
          <nav className="tabbar">
            <NavLink to="/" end>
              <span aria-hidden="true">☰</span>
              Shops
            </NavLink>
            <NavLink to="/visits/new" className="tab-primary">
              <span aria-hidden="true">＋</span>
              Log visit
            </NavLink>
            <NavLink to="/map">
              <span aria-hidden="true">⌖</span>
              Map
            </NavLink>
          </nav>
        </div>
      </ShopsProvider>
    </BrowserRouter>
  )
}
