import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/profiles', label: 'Profiles' },
  { path: '/provider-imports', label: 'Imports' },
  { path: '/addons', label: 'Add-ons' },
  { path: '/account', label: 'Account' },
  { path: '/api-keys', label: 'API Keys' },
]

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-medium">Crispy</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{user?.email}</span>
            <button
              onClick={() => { signOut(); navigate('/login') }}
              className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 flex gap-8 py-8">
        <nav className="w-44 shrink-0 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'rounded-lg px-3 py-2 text-sm transition-colors',
                location.pathname === item.path
                  ? 'bg-stone-800 text-stone-100 font-medium'
                  : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
