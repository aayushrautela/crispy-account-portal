import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import avatarImg from '../assets/avatar.png'
import { Button } from '@heroui/react'
import { ArrowBackIcon, SearchIcon, LogoutIcon } from '../icons'

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const { signOut } = useAuth()

  // Fix for hardware back button closing the webview on deep links
  useEffect(() => {
    if (!isHome && window.history.state && window.history.state.idx === 0) {
      // User landed directly on a subpage. Inject Home into history.
      navigate('/', { replace: true })
      setTimeout(() => {
        navigate(location.pathname + location.search + location.hash, { replace: false })
      }, 0)
    }
  }, [isHome, location, navigate])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-divider">
        <div className="max-w-4xl mx-auto w-full px-4">
          <nav className="flex items-center justify-between h-16">
            
            <div className="w-12 flex justify-center">
              {!isHome && (
                <Button isIconOnly className="bg-transparent hover:bg-default-100 rounded-full" onPress={() => navigate('/')} aria-label="home">
                  <ArrowBackIcon />
                </Button>
              )}
            </div>

            <h1 className="flex-grow text-center text-lg font-medium">
              Crispy Account
            </h1>

            <div className="w-16 flex justify-end gap-1">
              {isHome ? (
                <>
                  <Button isIconOnly className="bg-transparent hover:bg-default-100 rounded-full" aria-label="search">
                    <SearchIcon />
                  </Button>
                  <Button isIconOnly className="bg-transparent hover:bg-default-100 rounded-full" aria-label="logout" onPress={() => signOut()}>
                    <LogoutIcon />
                  </Button>
                </>
              ) : (
                <img src={avatarImg} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-primary" />
              )}
            </div>

          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-grow">
        {children}
      </main>
    </div>
  )
}
