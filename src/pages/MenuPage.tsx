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

  function printMenu() {
    const w = window.open('', '_blank')
    if (!w) return
    const renderSection = (label: string, items: MenuItem[]) => {
      if (items.length === 0) return ''
      return `
        <div class="section">
          <div class="section-header">
            <span class="dot">•</span>
            <span class="section-label">${label}</span>
            <span class="dot">•</span>
          </div>
          ${items.map(i => `<div class="item">${i.name}</div>`).join('')}
        </div>`
    }
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Backyard On Barton Menu</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>
  <style>
    @page { size: letter portrait; margin: 0.75in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cormorant Garamond', serif;
      text-align: center;
      color: #1a1a1a;
      background: white;
    }
    .title {
      font-family: 'Great Vibes', cursive;
      font-size: 64pt;
      line-height: 1.1;
      margin-bottom: 4pt;
    }
    .subtitle {
      font-family: 'Great Vibes', cursive;
      font-size: 52pt;
      line-height: 1.1;
      margin-bottom: 36pt;
    }
    .section { margin-bottom: 28pt; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10pt;
      margin-bottom: 10pt;
    }
    .dot { color: #bbb; font-size: 14pt; }
    .section-label {
      font-size: 10pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      font-style: italic;
      color: #444;
    }
    .item {
      font-size: 14pt;
      line-height: 1.7;
      color: #1a1a1a;
    }
  </style>
</head>
<body>
  <div class="title">Backyard On Barton</div>
  <div class="subtitle">Menu</div>
  ${renderSection('Main', mains)}
  ${renderSection('Sides', sides)}
  ${renderSection('Drinks', drinks)}
</body>
</html>`)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 500)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Controls */}
      <div className="no-print flex justify-between items-center mb-6">
        <button
          onClick={() => setEditing(e => !e)}
          className="text-sm border border-gray-300 rounded-full px-5 py-2 hover:bg-gray-50 font-display tracking-wider uppercase transition-colors"
        >
          {editing ? 'Done Editing' : 'Edit Menu'}
        </button>
        <button
          onClick={printMenu}
          className="text-sm border border-gray-300 rounded-full px-5 py-2 hover:bg-gray-50 font-display tracking-wider uppercase transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Elegant menu display */}
      <div className="bg-white border border-gray-100 shadow-md rounded-sm py-14 px-10 text-center">
        <h1 className="font-script leading-tight mb-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#1a1a1a' }}>
          Backyard On Barton
        </h1>
        <div className="font-script leading-tight mb-10" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#2a2a2a' }}>
          Menu
        </div>

        <MenuSection label="Main" items={mains} editing={editing} onRemove={removeItem} onStock={updateStock} />
        <MenuSection label="Sides" items={sides} editing={editing} onRemove={removeItem} onStock={updateStock} />
        <MenuSection label="Drinks" items={drinks} editing={editing} onRemove={removeItem} onStock={updateStock} />
      </div>

      {/* Add item form */}
      {editing && (
        <div className="no-print mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-display text-xs tracking-widest uppercase text-gray-400 mb-4">Add Item to Menu</p>
          <div className="flex gap-3 flex-wrap">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Item name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 outline-none focus:border-gray-500"
            />
            <select
              value={newCat}
              onChange={e => setNewCat(e.target.value as Category)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 outline-none focus:border-gray-500"
            />
            <button
              onClick={addItem}
              className="bg-gray-900 text-white rounded-lg px-5 py-2 text-sm hover:bg-gray-700 transition-colors"
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
    <div className="mb-10">
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-gray-300">•</span>
        <span className="font-display tracking-[0.25em] uppercase text-xs text-gray-500 italic">{label}</span>
        <span className="text-gray-300">•</span>
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-center gap-3">
            <span className="font-display text-gray-800" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
              {item.name}
            </span>
            {/* stock shown only when editing, never in print */}
            {editing && item.stock !== null && (
              <span className="no-print text-xs text-gray-400 font-display">({item.remaining}/{item.stock})</span>
            )}
            {editing && (
              <div className="no-print flex items-center gap-2">
                <input
                  type="number"
                  placeholder="qty"
                  value={item.stock ?? ''}
                  onChange={e => onStock(item.id, e.target.value)}
                  className="border border-gray-200 rounded px-2 py-0.5 text-xs w-16 outline-none"
                />
                <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
