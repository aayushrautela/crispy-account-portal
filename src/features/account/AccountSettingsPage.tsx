import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useSession'
import { 
  Box, 
  Card, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Typography, 
  Collapse,
  TextField,
  Button
} from '@mui/material'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import MovieIcon from '@mui/icons-material/Movie'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export function AccountSettingsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 500 }}>Account</Typography>

      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <List disablePadding>
          <ApiKeyRow
            provider="openrouter"
            title="OpenRouter API Key"
            subtitle="Routes LLM requests via secure endpoints"
            iconBg="#1a73e8"
            icon={<VpnKeyIcon />}
          />
          <ApiKeyRow
            provider="mdblist"
            title="MDBList API Key"
            subtitle="Movie metadata, ratings, and filters"
            iconBg="#e37400"
            icon={<MovieIcon />}
          />
        </List>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 4, borderColor: 'error.main' }}>
        <List disablePadding>
          <DeleteAccountRow signOut={signOut} navigate={navigate} />
        </List>
      </Card>
    </Box>
  )
}

function ApiKeyRow({
  provider,
  title,
  iconBg,
  icon,
}: {
  provider: string
  title: string
  subtitle: string
  iconBg: string
  icon: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')

  const { data: result, isLoading } = useQuery({
    queryKey: ['secret', provider],
    queryFn: () => api.secrets[provider as 'ai' | 'mdblist'].get(),
  })

  const secret = result?.secret

  const putMut = useMutation({
    mutationFn: async (v: string) => api.secrets[provider as 'ai' | 'mdblist'].put(v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secret', provider] })
      setValue('')
    },
  })

  const delMut = useMutation({
    mutationFn: async () => api.secrets[provider as 'ai' | 'mdblist'].delete(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secret', provider] }),
  })

  const statusText = isLoading ? 'Checking...' : secret?.present ? `Present (${secret.fingerprint})` : 'Not configured'

  return (
    <>
      <ListItemButton onClick={() => setExpanded(!expanded)} sx={{ py: 2, px: 3 }}>
        <ListItemIcon>
          <Avatar sx={{ bgcolor: iconBg, width: 40, height: 40, color: '#fff' }}>
            {icon}
          </Avatar>
        </ListItemIcon>
        <ListItemText 
          primary={<Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{title}</Typography>}
          secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{statusText}</Typography>}
        />
        <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </ListItemButton>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {secret?.present && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                color="error" 
                size="small" 
                disabled={delMut.isPending} 
                onClick={() => delMut.mutate()}
              >
                Remove
              </Button>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder={provider === 'openrouter' ? 'sk-or-...' : 'Enter MDBList key'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
            />
            <Button 
              variant="contained" 
              disabled={!value.trim() || putMut.isPending} 
              onClick={() => value.trim() && putMut.mutate(value.trim())}
              sx={{ minWidth: 100 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Collapse>
    </>
  )
}

function DeleteAccountRow({
  signOut,
  navigate,
}: {
  signOut: () => Promise<void>
  navigate: (path: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const queryClient = useQueryClient()

  const delMut = useMutation({
    mutationFn: async () => api.account.delete(),
    onSuccess: async () => {
      await signOut()
      queryClient.clear()
      navigate('/signed-out')
    },
  })

  return (
    <>
      <ListItemButton onClick={() => setConfirming(!confirming)} sx={{ py: 2, px: 3 }}>
        <ListItemIcon>
          <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40, color: '#fff' }}>
            <DeleteIcon />
          </Avatar>
        </ListItemIcon>
        <ListItemText 
          primary={<Typography sx={{ fontWeight: 500, color: 'error.main' }}>Delete account</Typography>}
          secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Permanently delete your account and all data</Typography>}
        />
        <ExpandMoreIcon sx={{ transform: confirming ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </ListItemButton>

      <Collapse in={confirming} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This is permanent. Type <Typography component="span" color="error.main" sx={{ fontWeight: 'bold' }}>DELETE</Typography> to confirm.
          </Typography>
          <TextField
            size="small"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              disabled={confirmText !== 'DELETE' || delMut.isPending}
              onClick={() => delMut.mutate()}
            >
              Delete Permanently
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setConfirming(false)
                setConfirmText('')
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>
    </>
  )
}
