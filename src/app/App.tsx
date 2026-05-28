import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeroUIProvider } from '@heroui/react'
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

function HeroUIProviderWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return <HeroUIProvider navigate={navigate}>{children}</HeroUIProvider>;
}

export function App() {
  return (
    <main className="dark text-foreground bg-background min-h-screen">
      <BrowserRouter>
        <HeroUIProviderWrapper>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </QueryClientProvider>
        </HeroUIProviderWrapper>
      </BrowserRouter>
    </main>
  )
}
