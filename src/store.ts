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
  cookSpecs: string[]  // multi-select across all spec groups
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

// Groups of spec chips — each group is independent (multi-select across groups, single-select within)
export interface SpecGroup {
  label: string
  options: string[]
  multi?: boolean // if true, can pick multiple within this group too
}

export const COOK_SPEC_GROUPS: Record<string, SpecGroup[]> = {
  hamburger: [
    { label: 'Doneness', options: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'] },
    { label: 'Bun', options: ['With Bun', 'No Bun'] },
  ],
  cheeseburger: [
    { label: 'Doneness', options: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'] },
    { label: 'Bun', options: ['With Bun', 'No Bun'] },
    { label: 'Cheese', options: ['American', 'Cheddar', 'Swiss', 'Extra Cheese'] },
  ],
  'hot dog': [
    { label: 'Style', options: ['Standard', 'Char Grilled', 'Butterflied'] },
    { label: 'Bun', options: ['With Bun', 'No Bun'] },
  ],
  corn: [
    { label: 'Method', options: ['In Husk', 'Husked & Foil', 'Direct Grill'] },
    { label: 'Seasoning', options: ['Buttered', 'Plain', 'Salt & Pepper', 'Elote Style'], multi: true },
  ],
}

export function getSpecGroups(name: string): SpecGroup[] {
  const lower = name.toLowerCase()
  for (const key of Object.keys(COOK_SPEC_GROUPS)) {
    if (lower.includes(key)) return COOK_SPEC_GROUPS[key]
  }
  return []
}

// Internal temp for doneness levels
export const DONENESS_TEMPS: Record<string, string> = {
  'Rare': '125°F internal',
  'Medium Rare': '135°F internal',
  'Medium': '145°F internal',
  'Medium Well': '155°F internal',
  'Well Done': '160°F internal',
}

export function getGrillGuide(_name: string): string | null {
  return null
}

// Keep getCookSpecs/getCookTime as shims so KitchenPage still compiles
export function getCookSpecs(name: string): string[] {
  return getSpecGroups(name).flatMap(g => g.options)
}
export function getCookTime(name: string): string | null {
  return getGrillGuide(name)
}
