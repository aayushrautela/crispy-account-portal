import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { AuthProvider } from '../auth/useSession'
import { PortalLayout } from '../layouts/PortalLayout'
import { RequireAuth } from '../auth/RequireAuth'

import { AppHandoffPage } from '../pages/AppHandoffPage'
import { SignedOutPage } from '../pages/SignedOutPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AccountSettingsPage } from '../features/account/AccountSettingsPage'
import { ProfilesPage } from '../features/profiles/ProfilesPage'
import { ProviderImportsPage } from '../features/providerImports/ProviderImportsPage'
import { AddonsPage } from '../features/addons/AddonsPage'
import { ApiKeysPage } from '../features/personalAccessTokens/ApiKeysPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a8c7fa', // Google Blue in dark mode
    },
    background: {
      default: '#1c1b1d', // m3-bg equivalent
      paper: '#2d2e30',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
})

function AppRoutes() {
  return (
    <Routes>
      <Route path="/app-handoff" element={<AppHandoffPage />} />
      <Route path="/signed-out" element={<SignedOutPage />} />
      <Route path="/" element={<RequireAuth><PortalLayout><DashboardPage /></PortalLayout></RequireAuth>} />
      <Route path="/account" element={<RequireAuth><PortalLayout><AccountSettingsPage /></PortalLayout></RequireAuth>} />
      <Route path="/profiles" element={<RequireAuth><PortalLayout><ProfilesPage /></PortalLayout></RequireAuth>} />
      <Route path="/provider-imports" element={<RequireAuth><PortalLayout><ProviderImportsPage /></PortalLayout></RequireAuth>} />
      <Route path="/addons" element={<RequireAuth><PortalLayout><AddonsPage /></PortalLayout></RequireAuth>} />
      <Route path="/api-keys" element={<RequireAuth><PortalLayout><ApiKeysPage /></PortalLayout></RequireAuth>} />
    </Routes>
  )
}

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
