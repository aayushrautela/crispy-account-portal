import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Spinner } from '../components/Spinner'

export function DashboardPage() {
  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me.get(),
  })

  if (isLoading) return <Spinner />
  if (!me) return <p className="text-stone-500">Failed to load.</p>

  const { user, accountSettings, profiles } = me as any

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <Card>
        <h2 className="text-sm font-medium text-stone-400 mb-3">Account</h2>
        <p className="text-sm">{user.email}</p>
        <p className="text-sm text-stone-500">ID: {user.id}</p>
        <p className="text-sm text-stone-500 mt-1">
          Tier: {String(accountSettings?.pricingTier ?? 'free')}
        </p>
      </Card>
      <Card>
        <h2 className="text-sm font-medium text-stone-400 mb-3">Profiles</h2>
        <p className="text-sm text-stone-500">
          {Array.isArray(profiles) ? profiles.length : 0} profile(s)
        </p>
      </Card>
    </div>
  )
}
