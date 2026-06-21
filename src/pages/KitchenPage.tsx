import { DONENESS_TEMPS, type AppState, type Order } from '../store'

interface Props {
  state: AppState
  setState: (updater: (s: AppState) => AppState) => void
}

export default function KitchenPage({ state, setState }: Props) {
  const activeOrders = state.orders.filter(o => o.status !== 'done')
  const doneOrders = state.orders.filter(o => o.status === 'done')

  function setStatus(id: string, status: Order['status']) {
    setState(s => ({
      ...s,
      orders: s.orders.map(o => o.id === id ? { ...o, status } : o),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-script text-5xl text-amber-300 leading-tight">Kitchen</h1>
            <p className="font-display italic text-gray-400 tracking-wider text-sm">Backyard On Barton</p>
          </div>
          <div className="text-right">
            <span className="text-gray-400 text-sm font-display">
              {activeOrders.length} active · {doneOrders.length} done
            </span>
          </div>
        </div>

        {activeOrders.length === 0 && (
          <div className="text-center py-24 text-gray-600 font-display italic text-xl">
            No active orders
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {activeOrders.map(order => (
            <KitchenCard key={order.id} order={order} onStatus={status => setStatus(order.id, status)} />
          ))}
        </div>

        {doneOrders.length > 0 && (
          <div className="mt-10">
            <p className="font-display tracking-widest uppercase text-xs text-gray-600 mb-3">Completed</p>
            <div className="grid gap-3 md:grid-cols-2">
              {doneOrders.map(order => (
                <div key={order.id} className="border border-gray-800 rounded-lg p-4 opacity-50">
                  <div className="flex justify-between items-center">
                    <span className="font-display text-gray-400">{order.label}</span>
                    <button
                      onClick={() => setStatus(order.id, 'open')}
                      className="text-xs text-gray-600 hover:text-gray-400"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KitchenCard({ order, onStatus }: { order: Order; onStatus: (s: Order['status']) => void }) {
  const statusColors: Record<Order['status'], string> = {
    open: 'border-amber-500',
    'in-progress': 'border-blue-500',
    done: 'border-green-600',
  }

  return (
    <div className={`border-l-4 ${statusColors[order.status]} bg-gray-900 rounded-lg p-5`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-xl text-white">{order.label}</h3>
          <p className="text-xs text-gray-500 font-display">{order.people.length} {order.people.length === 1 ? 'person' : 'people'}</p>
        </div>
        <div className="flex gap-2">
          {order.status === 'open' && (
            <button
              onClick={() => onStatus('in-progress')}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full"
            >
              Start
            </button>
          )}
          {order.status === 'in-progress' && (
            <button
              onClick={() => onStatus('done')}
              className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* Per-person breakdown */}
      {order.people.map(person => {
        const hasFood = person.food.length > 0
        const hasDrinks = person.drinks.length > 0
        if (!hasFood && !hasDrinks) return null
        return (
          <div key={person.id} className="mb-4 last:mb-0">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-display mb-1">{person.name}</p>
            {person.food.map((f, i) => {
              const specs = f.cookSpecs ?? []
              const doneness = specs.find(s => DONENESS_TEMPS[s])
              const temp = doneness ? DONENESS_TEMPS[doneness] : null
              const otherSpecs = specs.filter(s => !DONENESS_TEMPS[s])
              return (
                <div key={i} className="ml-2 mb-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-white font-display">{f.quantity}× {f.name}</span>
                    {doneness && <span className="text-amber-400 text-sm font-medium">{doneness}</span>}
                    {temp && <span className="text-amber-300 text-xs">({temp})</span>}
                    {otherSpecs.map(s => (
                      <span key={s} className="text-gray-300 text-xs bg-gray-800 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                  {f.notes && <p className="text-gray-400 text-xs italic ml-1 mt-0.5">{f.notes}</p>}
                </div>
              )
            })}
            {person.drinks.map((d, i) => (
              <div key={i} className="ml-2 mb-1">
                <span className="text-blue-300 font-display text-sm">{d.quantity}× {d.name}</span>
                {d.notes && <span className="ml-2 text-gray-400 text-sm italic">({d.notes})</span>}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
