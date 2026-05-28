import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import avatarImg from '../assets/avatar.png'
import { Card, Spinner } from '@heroui/react'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import GroupIcon from '@mui/icons-material/Group'
import SyncIcon from '@mui/icons-material/Sync'
import ExtensionIcon from '@mui/icons-material/Extension'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

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
    <div 
      onClick={onClick}
      className="flex items-center gap-4 px-6 py-4 hover:bg-default-100 cursor-pointer transition-colors"
    >
      <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-default-500 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRightIcon className="text-default-400" />
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
    <div className="flex flex-col gap-6 pt-4">
      
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
              icon={<PersonIcon />}
              iconBg="#34a853"
              title="Personal info"
              subtitle="Name, email, API keys, and account settings"
              onClick={() => navigate('/account')}
            />
            <Row
              icon={<SecurityIcon />}
              iconBg="#1a73e8"
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
              icon={<GroupIcon />}
              iconBg="#a733ff"
              title="Profiles"
              subtitle={`${profileCount} profile(s) — name, language, region`}
              onClick={() => navigate('/profiles')}
            />
            <Row
              icon={<SyncIcon />}
              iconBg="#d01884"
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
              icon={<ExtensionIcon />}
              iconBg="#e37400"
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
