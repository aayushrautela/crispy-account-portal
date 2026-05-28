import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import avatarImg from '../assets/avatar.png'
import { Card, Spinner } from '@heroui/react'
import { PersonIcon, SecurityIcon, GroupIcon, SyncIcon, ExtensionIcon, ChevronRightIcon } from '../icons'

function Row({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 hover:bg-default-100 cursor-pointer transition-colors"
    >
      <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-default-500 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRightIcon className="text-default-400 w-5 h-5" />
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me.get(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    )
  }
  
  if (!me) {
    return (
      <div className="p-12">
        <p className="text-default-500 text-center">Failed to load.</p>
      </div>
    )
  }

  const { user, profiles } = me as any
  const userName = user.email ? user.email.split('@')[0] : 'User'
  const userEmail = user.email || ''
  const profileCount = Array.isArray(profiles) ? profiles.length : 0

  return (
    <div className="flex flex-col gap-4 pt-4">
      
      {/* User Profile — matches Google Account profile block */}
      <div className="flex items-center gap-4 pb-2">
        <img src={avatarImg} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary" />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium capitalize truncate">
            {userName}
          </h2>
          <p className="text-default-500 truncate">
            {userEmail}
          </p>
        </div>
      </div>

      {/* Account group */}
      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            <Row
              icon={<PersonIcon className="w-5 h-5" />}
              iconBg="#e6f4ea"
              iconColor="#137333"
              title="Personal info"
              subtitle="Name, email, API keys, and account settings"
              onClick={() => navigate('/account')}
            />
            <Row
              icon={<SecurityIcon className="w-5 h-5" />}
              iconBg="#e8f0fe"
              iconColor="#1967d2"
              title="Security & sign-in"
              subtitle="Password, API tokens, and security settings"
              onClick={() => navigate('/api-keys')}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Data group */}
      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            <Row
              icon={<GroupIcon className="w-5 h-5" />}
              iconBg="#f3e8fd"
              iconColor="#7627bb"
              title="Profiles"
              subtitle={`${profileCount} profile(s) — name, language, region`}
              onClick={() => navigate('/profiles')}
            />
            <Row
              icon={<SyncIcon className="w-5 h-5" />}
              iconBg="#fce8f3"
              iconColor="#c4185e"
              title="Imports & syncing"
              subtitle="Connect Trakt, Simkl, and manage import jobs"
              onClick={() => navigate('/provider-imports')}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Extensions group */}
      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            <Row
              icon={<ExtensionIcon className="w-5 h-5" />}
              iconBg="#fef7e0"
              iconColor="#c5630c"
              title="Add-ons"
              subtitle="Install and manage third-party extensions"
              onClick={() => navigate('/addons')}
            />
          </div>
        </Card.Content>
      </Card>

    </div>
  )
}
