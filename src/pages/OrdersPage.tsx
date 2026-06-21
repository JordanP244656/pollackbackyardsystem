import { useState } from 'react'
import { uid, getCookSpecs, getCookTime, type AppState, type Order, type Person, type OrderItem } from '../store'

interface Props {
  state: AppState
  setState: (updater: (s: AppState) => AppState) => void
}

export default function OrdersPage({ state, setState }: Props) {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    state.orders.length > 0 ? state.orders[state.orders.length - 1].id : null
  )
  const [newOrderLabel, setNewOrderLabel] = useState('')
  const [showNewOrder, setShowNewOrder] = useState(false)

  const foodItems = state.menuItems.filter(i => i.category !== 'drink')
  const drinkItems = state.menuItems.filter(i => i.category === 'drink')
  const activeOrder = state.orders.find(o => o.id === activeOrderId) ?? null

  function createOrder() {
    const label = newOrderLabel.trim() || `Order ${state.orders.length + 1}`
    const order: Order = { id: uid(), label, createdAt: Date.now(), people: [], status: 'open' }
    setState(s => ({ ...s, orders: [...s.orders, order] }))
    setActiveOrderId(order.id)
    setNewOrderLabel('')
    setShowNewOrder(false)
  }

  function addPerson(orderId: string, name: string) {
    const person: Person = { id: uid(), name, food: [], drinks: [] }
    setState(s => ({
      ...s,
      orders: s.orders.map(o =>
        o.id === orderId ? { ...o, people: [...o.people, person] } : o
      ),
    }))
  }

  function removePerson(orderId: string, personId: string) {
    setState(s => ({
      ...s,
      orders: s.orders.map(o =>
        o.id === orderId ? { ...o, people: o.people.filter(p => p.id !== personId) } : o
      ),
    }))
  }

  function updatePerson(orderId: string, person: Person) {
    setState(s => ({
      ...s,
      orders: s.orders.map(o =>
        o.id === orderId ? { ...o, people: o.people.map(p => p.id === person.id ? person : p) } : o
      ),
    }))
  }

  function deleteOrder(id: string) {
    setState(s => ({ ...s, orders: s.orders.filter(o => o.id !== id) }))
    if (activeOrderId === id) setActiveOrderId(null)
  }

  function printReceipt(order: Order) {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>Receipt - ${order.label}</title>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>
      <style>
        body { font-family: 'Cormorant Garamond', serif; max-width: 400px; margin: 40px auto; text-align: center; color: #222; }
        h1 { font-family: 'Great Vibes', cursive; font-size: 48px; margin: 0; }
        .sub { font-style: italic; letter-spacing: 0.2em; font-size: 12px; margin-bottom: 24px; }
        .person { margin: 20px 0; text-align: left; border-top: 1px solid #ddd; padding-top: 12px; }
        .person h3 { font-size: 18px; margin-bottom: 8px; }
        .item { display: flex; justify-content: space-between; font-size: 14px; margin: 4px 0; }
        .spec { font-size: 12px; color: #666; margin-left: 8px; font-style: italic; }
        .footer { margin-top: 32px; font-style: italic; font-size: 12px; color: #999; }
      </style></head><body>`)
    w.document.write(`<h1>Backyard On Barton</h1><div class="sub">${order.label} &nbsp;·&nbsp; ${new Date(order.createdAt).toLocaleDateString()}</div>`)
    for (const p of order.people) {
      w.document.write(`<div class="person"><h3>${p.name}</h3>`)
      for (const f of p.food) {
        w.document.write(`<div class="item"><span>${f.quantity}× ${f.name}</span></div>`)
        if (f.cookSpec) w.document.write(`<div class="spec">Cook: ${f.cookSpec}</div>`)
        if (f.notes) w.document.write(`<div class="spec">Notes: ${f.notes}</div>`)
      }
      for (const d of p.drinks) {
        w.document.write(`<div class="item"><span>${d.quantity}× ${d.name}</span></div>`)
        if (d.notes) w.document.write(`<div class="spec">Notes: ${d.notes}</div>`)
      }
      w.document.write('</div>')
    }
    w.document.write(`<div class="footer">Thank you!</div></body></html>`)
    w.document.close()
    w.print()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Order picker */}
      <div className="flex gap-2 flex-wrap mb-6 items-center no-print">
        {state.orders.map(o => (
          <button
            key={o.id}
            onClick={() => setActiveOrderId(o.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-display tracking-wider border transition-colors ${activeOrderId === o.id ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-600'}`}
          >
            {o.label}
          </button>
        ))}
        {showNewOrder ? (
          <div className="flex gap-2 items-center">
            <input
              autoFocus
              value={newOrderLabel}
              onChange={e => setNewOrderLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createOrder()}
              placeholder="Order name (optional)"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-gray-500"
            />
            <button onClick={createOrder} className="bg-gray-900 text-white rounded px-3 py-1.5 text-sm">Create</button>
            <button onClick={() => setShowNewOrder(false)} className="text-gray-400 text-sm">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewOrder(true)}
            className="px-4 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600"
          >
            + New Order
          </button>
        )}
      </div>

      {activeOrder ? (
        <OrderEditor
          order={activeOrder}
          foodItems={foodItems.map(i => i.name)}
          drinkItems={drinkItems.map(i => i.name)}
          onAddPerson={name => addPerson(activeOrder.id, name)}
          onRemovePerson={pid => removePerson(activeOrder.id, pid)}
          onUpdatePerson={p => updatePerson(activeOrder.id, p)}
          onDelete={() => deleteOrder(activeOrder.id)}
          onPrint={() => printReceipt(activeOrder)}
        />
      ) : (
        <div className="text-center py-20 text-gray-400 font-display italic text-xl">
          No order selected. Create one above.
        </div>
      )}
    </div>
  )
}

function OrderEditor({
  order, foodItems, drinkItems,
  onAddPerson, onRemovePerson, onUpdatePerson, onDelete, onPrint
}: {
  order: Order
  foodItems: string[]
  drinkItems: string[]
  onAddPerson: (name: string) => void
  onRemovePerson: (id: string) => void
  onUpdatePerson: (p: Person) => void
  onDelete: () => void
  onPrint: () => void
}) {
  const [newPersonName, setNewPersonName] = useState('')
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null)

  function addPerson() {
    if (!newPersonName.trim()) return
    onAddPerson(newPersonName.trim())
    setNewPersonName('')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-script text-4xl text-gray-800">{order.label}</h2>
        <div className="flex gap-2">
          <button onClick={onPrint} className="text-sm border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50">Print Receipt</button>
          <button onClick={onDelete} className="text-sm border border-red-200 text-red-400 rounded-full px-4 py-1.5 hover:bg-red-50">Delete</button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {order.people.map(person => (
          <PersonCard
            key={person.id}
            person={person}
            foodItems={foodItems}
            drinkItems={drinkItems}
            expanded={expandedPerson === person.id}
            onToggle={() => setExpandedPerson(expandedPerson === person.id ? null : person.id)}
            onUpdate={onUpdatePerson}
            onRemove={() => onRemovePerson(person.id)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newPersonName}
          onChange={e => setNewPersonName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPerson()}
          placeholder="Person's name"
          className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 outline-none focus:border-gray-500"
        />
        <button onClick={addPerson} className="bg-gray-900 text-white rounded px-4 py-2 text-sm hover:bg-gray-700">
          Add Person
        </button>
      </div>
    </div>
  )
}

function PersonCard({
  person, foodItems, drinkItems, expanded, onToggle, onUpdate, onRemove
}: {
  person: Person
  foodItems: string[]
  drinkItems: string[]
  expanded: boolean
  onToggle: () => void
  onUpdate: (p: Person) => void
  onRemove: () => void
}) {
  function addFood(name: string) {
    const specs = getCookSpecs(name)
    const item: OrderItem = { menuItemId: name, name, quantity: 1, cookSpec: specs[0] ?? '' }
    onUpdate({ ...person, food: [...person.food, item] })
  }

  function addDrink(name: string) {
    const item: OrderItem = { menuItemId: name, name, quantity: 1 }
    onUpdate({ ...person, drinks: [...person.drinks, item] })
  }

  function updateFoodItem(idx: number, patch: Partial<OrderItem>) {
    const food = person.food.map((f, i) => i === idx ? { ...f, ...patch } : f)
    onUpdate({ ...person, food })
  }

  function updateDrinkItem(idx: number, patch: Partial<OrderItem>) {
    const drinks = person.drinks.map((d, i) => i === idx ? { ...d, ...patch } : d)
    onUpdate({ ...person, drinks })
  }

  function removeFood(idx: number) {
    onUpdate({ ...person, food: person.food.filter((_, i) => i !== idx) })
  }

  function removeDrink(idx: number) {
    onUpdate({ ...person, drinks: person.drinks.filter((_, i) => i !== idx) })
  }

  const summary = [
    ...person.food.map(f => `${f.quantity}× ${f.name}`),
    ...person.drinks.map(d => `${d.quantity}× ${d.name}`),
  ].join(', ')

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div>
          <span className="font-display text-lg text-gray-800">{person.name}</span>
          {summary && <span className="text-xs text-gray-400 ml-3 font-display">{summary}</span>}
        </div>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          {/* Food */}
          <div>
            <p className="text-xs font-display tracking-widest uppercase text-gray-400 mb-2">Food</p>
            {person.food.map((f, idx) => {
              const specs = getCookSpecs(f.name)
              const cookTime = getCookTime(f.name)
              return (
                <div key={idx} className="mb-3 bg-gray-50 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-display text-gray-800">{f.name}</span>
                    <input
                      type="number"
                      min="1"
                      value={f.quantity}
                      onChange={e => updateFoodItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                      className="border border-gray-200 rounded px-2 py-0.5 text-xs w-14 outline-none"
                    />
                    <button onClick={() => removeFood(idx)} className="text-red-400 text-xs ml-auto">✕</button>
                  </div>
                  {cookTime && <p className="text-xs text-gray-400 italic mb-2">⏱ {cookTime}</p>}
                  {specs.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400 mb-1">Cook style:</p>
                      <div className="flex flex-wrap gap-1">
                        {specs.map(s => (
                          <button
                            key={s}
                            onClick={() => updateFoodItem(idx, { cookSpec: s })}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${f.cookSpec === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    value={f.notes ?? ''}
                    onChange={e => updateFoodItem(idx, { notes: e.target.value })}
                    placeholder="Special notes..."
                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full outline-none focus:border-gray-400"
                  />
                </div>
              )
            })}
            <select
              onChange={e => { if (e.target.value) addFood(e.target.value); e.target.value = '' }}
              className="border border-dashed border-gray-300 rounded px-3 py-1.5 text-sm text-gray-500 w-full outline-none"
              defaultValue=""
            >
              <option value="" disabled>+ Add food item</option>
              {foodItems.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          {/* Drinks */}
          <div>
            <p className="text-xs font-display tracking-widest uppercase text-gray-400 mb-2">Drinks</p>
            {person.drinks.map((d, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2 bg-gray-50 rounded p-2">
                <span className="font-display text-gray-800 text-sm flex-1">{d.name}</span>
                <input
                  type="number"
                  min="1"
                  value={d.quantity}
                  onChange={e => updateDrinkItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                  className="border border-gray-200 rounded px-2 py-0.5 text-xs w-14 outline-none"
                />
                <input
                  value={d.notes ?? ''}
                  onChange={e => updateDrinkItem(idx, { notes: e.target.value })}
                  placeholder="Notes"
                  className="border border-gray-200 rounded px-2 py-0.5 text-xs w-28 outline-none"
                />
                <button onClick={() => removeDrink(idx)} className="text-red-400 text-xs">✕</button>
              </div>
            ))}
            <select
              onChange={e => { if (e.target.value) addDrink(e.target.value); e.target.value = '' }}
              className="border border-dashed border-gray-300 rounded px-3 py-1.5 text-sm text-gray-500 w-full outline-none"
              defaultValue=""
            >
              <option value="" disabled>+ Add drink</option>
              {drinkItems.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">Remove {person.name} from order</button>
        </div>
      )}
    </div>
  )
}
