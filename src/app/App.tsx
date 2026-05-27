import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/useSession'
import { PortalLayout } from '../layouts/PortalLayout'
import { RequireAuth } from '../auth/RequireAuth'

import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { AppLoginPage } from '../pages/AppLoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AccountSettingsPage } from '../features/account/AccountSettingsPage'
import { ProfilesPage } from '../features/profiles/ProfilesPage'
import { ProviderImportsPage } from '../features/providerImports/ProviderImportsPage'
import { AddonsPage } from '../features/addons/AddonsPage'
import { ApiKeysPage } from '../features/personalAccessTokens/ApiKeysPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/app-login" element={<AppLoginPage />} />
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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
