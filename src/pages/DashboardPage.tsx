import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Spinner } from '../components/Spinner'
import avatarImg from '../assets/avatar.png'

function Row({
  icon,
  iconBg,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-m3-hover/50 transition-colors text-left group"
    >
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-stone-100 font-sans">{title}</h3>
        <p className="text-xs text-stone-400 font-sans mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <svg
        className="w-4 h-4 text-stone-500 shrink-0 group-hover:text-stone-300 transition-colors"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
      </svg>
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me.get(),
  })

  if (isLoading) return <Spinner />
  if (!me) return <p className="text-stone-500 font-sans p-6">Failed to load.</p>

  const { user, profiles } = me as any
  const userName = user.email ? user.email.split('@')[0] : 'User'
  const userEmail = user.email || ''
  const profileCount = Array.isArray(profiles) ? profiles.length : 0

  return (
    <div className="flex flex-col gap-6 pt-4">

      {/* User Profile — matches Google Account profile block */}
      <div className="flex items-center gap-4 pb-2">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-m3-green bg-stone-800 shrink-0">
          <img src={avatarImg} alt="Avatar" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-medium text-stone-100 font-display capitalize truncate">{userName}</h2>
          <p className="text-sm text-stone-400 font-sans truncate">{userEmail}</p>
        </div>
        <svg className="w-5 h-5 text-stone-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      {/* Account group */}
      <Card noPadding>
        <div className="py-1">
          <Row
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            }
            iconBg="#34a853"
            title="Personal info"
            subtitle="Name, email, API keys, and account settings"
            onClick={() => navigate('/account')}
          />
          <Row
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            }
            iconBg="#1a73e8"
            title="Security & sign-in"
            subtitle="Password, API tokens, and security settings"
            onClick={() => navigate('/api-keys')}
          />
        </div>
      </Card>

      {/* Data group */}
      <Card noPadding>
        <div className="py-1">
          <Row
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            }
            iconBg="#a733ff"
            title="Profiles"
            subtitle={`${profileCount} profile(s) — name, language, region`}
            onClick={() => navigate('/profiles')}
          />
          <Row
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            }
            iconBg="#d01884"
            title="Imports & syncing"
            subtitle="Connect Trakt, Simkl, and manage import jobs"
            onClick={() => navigate('/provider-imports')}
          />
        </div>
      </Card>

      {/* Extensions group */}
      <Card noPadding>
        <div className="py-1">
          <Row
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" />
              </svg>
            }
            iconBg="#e37400"
            title="Add-ons"
            subtitle="Install and manage third-party extensions"
            onClick={() => navigate('/addons')}
          />
        </div>
      </Card>

    </div>
  )
}
