import { APIProvider } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import ShopsProvider from './data/ShopsProvider'
import { GOOGLE_MAP_ID, GOOGLE_MAPS_API_KEY } from './lib/google'
import { isSupabaseConfigured } from './lib/supabase'
import AddShop from './pages/AddShop'
import EditShop from './pages/EditShop'
import EditVisit from './pages/EditVisit'
import MapPage from './pages/MapPage'
import ShopDetail from './pages/ShopDetail'
import ShopList from './pages/ShopList'
import VisitForm from './pages/VisitForm'

const REQUIRED_ENV = {
  VITE_SUPABASE_URL: isSupabaseConfigured,
  VITE_SUPABASE_ANON_KEY: isSupabaseConfigured,
  VITE_GOOGLE_MAPS_API_KEY: Boolean(GOOGLE_MAPS_API_KEY),
  VITE_GOOGLE_MAP_ID: Boolean(GOOGLE_MAP_ID),
}

function SetupNotice({ missing }) {
  return (
    <div className="page setup">
      <h1>Almost there</h1>
      <p>These settings are missing. Add them in Vercel (Settings → Environment Variables) and redeploy, or in <code>.env</code> locally:</p>
      <ul>
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
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
  const missing = Object.keys(REQUIRED_ENV).filter((name) => !REQUIRED_ENV[name])
  if (missing.length) return <SetupNotice missing={missing} />

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <BrowserRouter>
        <ShopsProvider>
          <div className="app">
            <Main>
              <Routes>
                <Route path="/" element={<ShopList />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/shops/new" element={<AddShop />} />
                <Route path="/shops/:id" element={<ShopDetail />} />
                <Route path="/shops/:id/edit" element={<EditShop />} />
                <Route path="/visits/new" element={<VisitForm />} />
                <Route path="/visits/:id/edit" element={<EditVisit />} />
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
    </APIProvider>
  )
}
