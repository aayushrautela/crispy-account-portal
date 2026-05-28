import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import avatarImg from '../assets/avatar.png'
import { 
  Box, 
  Card, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Typography, 
  CircularProgress 
} from '@mui/material'
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
    <ListItemButton onClick={onClick} sx={{ py: 2, px: 3 }}>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: iconBg, width: 40, height: 40, color: '#fff' }}>
          {icon}
        </Avatar>
      </ListItemIcon>
      <ListItemText 
        primary={<Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{title}</Typography>} 
        secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      />
      <ChevronRightIcon color="action" />
    </ListItemButton>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }
  
  if (!me) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography color="text.secondary">Failed to load.</Typography>
      </Box>
    )
  }

  const { user, profiles } = me as any
  const userName = user.email ? user.email.split('@')[0] : 'User'
  const userEmail = user.email || ''
  const profileCount = Array.isArray(profiles) ? profiles.length : 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      
      {/* User Profile — matches Google Account profile block */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
        <Avatar src={avatarImg} alt="Avatar" sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'primary.main' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 500, textTransform: 'capitalize' }} noWrap>
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {userEmail}
          </Typography>
        </Box>
      </Box>

      {/* Account group */}
      <Card variant="outlined">
        <List disablePadding>
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
        </List>
      </Card>

      {/* Data group */}
      <Card variant="outlined">
        <List disablePadding>
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
        </List>
      </Card>

      {/* Extensions group */}
      <Card variant="outlined">
        <List disablePadding>
          <Row
            icon={<ExtensionIcon />}
            iconBg="#e37400"
            title="Add-ons"
            subtitle="Install and manage third-party extensions"
            onClick={() => navigate('/addons')}
          />
        </List>
      </Card>

    </Box>
  )
}
