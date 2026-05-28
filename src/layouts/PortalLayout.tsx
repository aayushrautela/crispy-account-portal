import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import avatarImg from '../assets/avatar.png'
import { AppBar, Toolbar, IconButton, Typography, Box, Container, Avatar } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import LogoutIcon from '@mui/icons-material/Logout'

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="md" disableGutters>
          <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
            
            <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}>
              {!isHome && (
                <IconButton component={Link} to="/" edge="start" color="inherit" aria-label="home">
                  <ArrowBackIcon />
                </IconButton>
              )}
            </Box>

            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 500 }}>
              Crispy Account
            </Typography>

            <Box sx={{ width: 48, display: 'flex', justifyContent: 'center', gap: 1 }}>
              {isHome ? (
                <>
                  <IconButton color="inherit" aria-label="search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton onClick={() => signOut()} color="inherit" aria-label="logout">
                    <LogoutIcon />
                  </IconButton>
                </>
              ) : (
                <Avatar src={avatarImg} alt="Avatar" sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.main' }} />
              )}
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}
