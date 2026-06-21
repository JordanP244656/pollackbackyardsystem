import { useState } from 'react'
import { uid, type AppState, type MenuItem, type Category } from '../store'

interface Props {
  state: AppState
  setState: (updater: (s: AppState) => AppState) => void
}


export default function MenuPage({ state, setState }: Props) {
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState<Category>('main')
  const [newStock, setNewStock] = useState('')

  const mains = state.menuItems.filter(i => i.category === 'main')
  const sides = state.menuItems.filter(i => i.category === 'side')
  const drinks = state.menuItems.filter(i => i.category === 'drink')

  function addItem() {
    if (!newName.trim()) return
    const stock = newStock ? parseInt(newStock) : null
    const item: MenuItem = {
      id: uid(),
      category: newCat,
      name: newName.trim(),
      stock,
      remaining: stock,
    }
    setState(s => ({ ...s, menuItems: [...s.menuItems, item] }))
    setNewName('')
    setNewStock('')
  }

  function removeItem(id: string) {
    setState(s => ({ ...s, menuItems: s.menuItems.filter(i => i.id !== id) }))
  }

  function updateStock(id: string, val: string) {
    const n = val === '' ? null : parseInt(val)
    setState(s => ({
      ...s,
      menuItems: s.menuItems.map(i =>
        i.id === id ? { ...i, stock: n, remaining: n } : i
      ),
    }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Elegant menu card */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-10 text-center mb-8">
        <h1 className="font-script text-6xl text-gray-800 leading-tight mb-1">Backyard On Barton</h1>
        <div className="font-script text-5xl text-gray-700 leading-tight mb-8">Menu</div>

        <MenuSection label="Main" items={mains} editing={editing} onRemove={removeItem} onStock={updateStock} />
        <MenuSection label="Sides" items={sides} editing={editing} onRemove={removeItem} onStock={updateStock} />
        <MenuSection label="Drinks" items={drinks} editing={editing} onRemove={removeItem} onStock={updateStock} />
      </div>

      {/* Controls */}
      <div className="no-print flex justify-between items-center mb-4">
        <button
          onClick={() => setEditing(e => !e)}
          className="text-sm border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50 font-display tracking-wider uppercase"
        >
          {editing ? 'Done Editing' : 'Edit Menu'}
        </button>
        <button
          onClick={() => window.print()}
          className="text-sm border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50 font-display tracking-wider uppercase"
        >
          Print Menu
        </button>
      </div>

      {editing && (
        <div className="no-print bg-white border border-gray-200 rounded p-6">
          <p className="font-display text-sm tracking-widest uppercase text-gray-500 mb-4">Add Item</p>
          <div className="flex gap-3 flex-wrap">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Item name"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 min-w-40 outline-none focus:border-gray-500"
            />
            <select
              value={newCat}
              onChange={e => setNewCat(e.target.value as Category)}
              className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="main">Main</option>
              <option value="side">Side</option>
              <option value="drink">Drink</option>
            </select>
            <input
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
              placeholder="Qty (optional)"
              type="number"
              min="0"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-32 outline-none focus:border-gray-500"
            />
            <button
              onClick={addItem}
              className="bg-gray-900 text-white rounded px-4 py-2 text-sm hover:bg-gray-700"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuSection({
  label, items, editing, onRemove, onStock
}: {
  label: string
  items: MenuItem[]
  editing: boolean
  onRemove: (id: string) => void
  onStock: (id: string, val: string) => void
}) {
  if (items.length === 0 && !editing) return null
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-gray-300 text-lg">•</span>
        <span className="font-display tracking-[0.25em] uppercase text-sm text-gray-700 italic">{label}</span>
        <span className="text-gray-300 text-lg">•</span>
      </div>
      <div className="space-y-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-center gap-3">
            <span className="font-display text-gray-800 text-lg">{item.name}</span>
            {item.stock !== null && (
              <span className="text-xs text-gray-400 font-display">({item.remaining}/{item.stock})</span>
            )}
            {editing && (
              <div className="no-print flex items-center gap-2 ml-2">
                <input
                  type="number"
                  placeholder="qty"
                  value={item.stock ?? ''}
                  onChange={e => onStock(item.id, e.target.value)}
                  className="border border-gray-200 rounded px-2 py-0.5 text-xs w-16 outline-none"
                />
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
