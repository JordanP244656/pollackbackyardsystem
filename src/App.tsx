import { useState, useCallback } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { loadState, saveState, type AppState } from './store'
import MenuPage from './pages/MenuPage'
import OrdersPage from './pages/OrdersPage'
import KitchenPage from './pages/KitchenPage'

export default function App() {
  const [state, setStateRaw] = useState<AppState>(loadState)

  const setState = useCallback((updater: (s: AppState) => AppState) => {
    setStateRaw(prev => {
      const next = updater(prev)
      saveState(next)
      return next
    })
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <nav className="no-print border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-6 h-12">
          <span className="font-script text-2xl text-gray-700 leading-none">Backyard On Barton</span>
          <div className="flex gap-3 ml-auto">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition-colors font-display tracking-widest uppercase text-xs ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              Menu
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition-colors font-display tracking-widest uppercase text-xs ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/kitchen"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition-colors font-display tracking-widest uppercase text-xs ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              Kitchen
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MenuPage state={state} setState={setState} />} />
        <Route path="/orders" element={<OrdersPage state={state} setState={setState} />} />
        <Route path="/kitchen" element={<KitchenPage state={state} setState={setState} />} />
      </Routes>
    </div>
  )
}
