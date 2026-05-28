import { Link, useLocation } from 'react-router-dom'

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-m3-bg text-[#e3e3e3] flex flex-col font-sans antialiased">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        {!isHome && (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-200 mb-6 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Home
          </Link>
        )}
        {children}
      </main>
    </div>
  )
}
