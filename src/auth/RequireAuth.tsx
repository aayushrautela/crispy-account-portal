import { useAuth } from './useSession'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center max-w-sm">
          <h1 className="text-lg font-medium text-stone-100 mb-2">Account portal</h1>
          <p className="text-sm text-stone-500">
            Open this page from the Crispy app to continue.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
