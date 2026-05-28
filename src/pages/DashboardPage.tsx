import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../auth/useSession'
import avatarImg from '../assets/avatar.png'

export function DashboardPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me.get(),
  })

  if (isLoading) return <Spinner />
  if (!me) return <p className="text-stone-500 font-sans p-6">Failed to load.</p>

  const { user, profiles } = me as any
  const userName = user.email ? user.email.split('@')[0] : 'User'
  const userEmail = user.email || 'guest@example.com'
  const profileCount = Array.isArray(profiles) ? profiles.length : 0

  const handleSignOut = async () => {
    await signOut()
    navigate('/signed-out')
  }

  return (
    <div className="flex flex-col gap-8">

      {/* User Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#34a853] bg-stone-800 shrink-0">
          <img src={avatarImg} alt="Avatar" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-stone-100 font-display capitalize truncate">{userName}</h1>
          <p className="text-xs text-stone-400 truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs font-medium text-[#a8c7fa] hover:text-[#c2e7ff] hover:bg-[#a8c7fa]/10 px-3 py-1.5 rounded-full transition-all shrink-0"
        >
          Sign out
        </button>
      </div>

      {/* 2x2 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Account */}
        <Card interactive onClick={() => navigate('/account')} className="flex flex-col gap-3 min-h-[160px]">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-m3-green/10 text-m3-green">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 font-display tracking-wide">Account</h3>
            <p className="text-xs text-stone-400 font-sans mt-1.5 leading-relaxed">
              API keys, credentials, and account settings.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <span className="text-xs text-stone-500 font-medium">{userEmail}</span>
          </div>
        </Card>

        {/* Profiles */}
        <Card interactive onClick={() => navigate('/profiles')} className="flex flex-col gap-3 min-h-[160px]">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-m3-purple/10 text-m3-purple">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 font-display tracking-wide">Profiles</h3>
            <p className="text-xs text-stone-400 font-sans mt-1.5 leading-relaxed">
              Manage user profiles, languages, and regions.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <span className="text-xs text-stone-500 font-medium">{profileCount} profile(s)</span>
          </div>
        </Card>

        {/* Imports */}
        <Card interactive onClick={() => navigate('/provider-imports')} className="flex flex-col gap-3 min-h-[160px]">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-m3-pink/10 text-m3-pink">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 font-display tracking-wide">Imports</h3>
            <p className="text-xs text-stone-400 font-sans mt-1.5 leading-relaxed">
              Sync with Trakt, Simkl, and other providers.
            </p>
          </div>
        </Card>

        {/* Add-ons */}
        <Card interactive onClick={() => navigate('/addons')} className="flex flex-col gap-3 min-h-[160px]">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-m3-orange/10 text-m3-orange">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 font-display tracking-wide">Add-ons</h3>
            <p className="text-xs text-stone-400 font-sans mt-1.5 leading-relaxed">
              Install and manage third-party extensions.
            </p>
          </div>
        </Card>

      </div>
    </div>
  )
}
