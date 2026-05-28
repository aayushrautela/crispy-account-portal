import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import avatarImg from '../assets/avatar.png'

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-m3-bg text-[#e3e3e3] flex flex-col font-sans antialiased">

      {/* Top Bar — matches Google Account header */}
      <header className="sticky top-0 z-30 bg-m3-bg/80 backdrop-blur-lg">
        <div className="flex items-center h-14 px-3 max-w-3xl mx-auto">
          {/* Left: back arrow on sub-pages, spacer on home */}
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            {!isHome && (
              <Link
                to="/"
                className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-m3-hover transition-colors"
              >
                <svg className="w-5 h-5 text-stone-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </Link>
            )}
          </div>

          {/* Center: Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-base font-medium text-stone-200 font-display">
              Crispy Account
            </h1>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            {isHome ? (
              <>
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-m3-hover transition-colors">
                  <svg className="w-5 h-5 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-m3-hover transition-colors"
                >
                  <svg className="w-5 h-5 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-m3-green/50 bg-stone-800">
                <img src={avatarImg} alt="Avatar" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-8">
        {children}
      </main>
    </div>
  )
}
