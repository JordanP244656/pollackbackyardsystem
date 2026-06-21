export type Category = 'main' | 'side' | 'drink'

export interface MenuItem {
  id: string
  category: Category
  name: string
  stock: number | null // null = unlimited
  remaining: number | null
}

export interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  cookSpec?: string  // e.g. "medium rare", "with bun", "buttered"
  notes?: string
}

export interface Person {
  id: string
  name: string
  food: OrderItem[]
  drinks: OrderItem[]
}

export interface Order {
  id: string
  label: string
  createdAt: number
  people: Person[]
  status: 'open' | 'in-progress' | 'done'
}

export interface AppState {
  menuItems: MenuItem[]
  orders: Order[]
}

const STORAGE_KEY = 'backyard-on-barton'

const DEFAULT_MENU: MenuItem[] = [
  { id: 'm1', category: 'main', name: 'Hamburger', stock: null, remaining: null },
  { id: 'm2', category: 'main', name: 'Cheeseburger', stock: null, remaining: null },
  { id: 'm3', category: 'main', name: 'Hot Dog', stock: null, remaining: null },
  { id: 's1', category: 'side', name: 'Corn', stock: null, remaining: null },
  { id: 'd1', category: 'drink', name: 'Lemonade', stock: null, remaining: null },
  { id: 'd2', category: 'drink', name: 'Arnold Palmer (Half & Half)', stock: null, remaining: null },
  { id: 'd3', category: 'drink', name: 'Peach Snapple Ice Tea', stock: null, remaining: null },
  { id: 'd4', category: 'drink', name: 'Seltzer', stock: null, remaining: null },
  { id: 'd5', category: 'drink', name: 'Water', stock: null, remaining: null },
  { id: 'd6', category: 'drink', name: 'Various Alcoholic Drinks', stock: null, remaining: null },
]

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { menuItems: DEFAULT_MENU, orders: [] }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Cook time / spec suggestions per item name keywords
export const COOK_SPECS: Record<string, string[]> = {
  hamburger: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done', 'With Bun', 'No Bun'],
  cheeseburger: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done', 'With Bun', 'No Bun', 'Extra Cheese'],
  'hot dog': ['Standard (~5 min)', 'Char Grilled', 'With Bun', 'No Bun', 'Ketchup & Mustard', 'Just Mustard'],
  corn: ['Husked on Grill (~15 min)', 'In Husk (~20 min)', 'Buttered', 'Plain', 'Salt & Pepper'],
}

export function getCookSpecs(name: string): string[] {
  const lower = name.toLowerCase()
  for (const key of Object.keys(COOK_SPECS)) {
    if (lower.includes(key)) return COOK_SPECS[key]
  }
  return []
}

export const COOK_TIMES: Record<string, string> = {
  hamburger: '~8–10 min total (flip at 4–5 min)',
  cheeseburger: '~8–10 min total, add cheese last minute',
  'hot dog': '~5 min, turning frequently',
  corn: '~15–20 min on grill, turning every 5 min',
}

export function getCookTime(name: string): string | null {
  const lower = name.toLowerCase()
  for (const key of Object.keys(COOK_TIMES)) {
    if (lower.includes(key)) return COOK_TIMES[key]
  }
  return null
}
