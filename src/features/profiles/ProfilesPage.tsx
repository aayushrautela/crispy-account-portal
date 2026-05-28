import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { Profile } from '../../api/types'
import {
  Box,
  Typography,
  Button,
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const AVATAR_COLORS = [
  { bg: 'rgba(26,115,232,0.15)', text: '#8ab4f8' },
  { bg: 'rgba(167,51,255,0.15)', text: '#c58af9' },
  { bg: 'rgba(208,24,132,0.15)', text: '#f28b82' },
  { bg: 'rgba(227,116,0,0.15)', text: '#fcad70' },
  { bg: 'rgba(52,168,83,0.15)', text: '#81c995' },
]

export function ProfilesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Profile | null>(null)
  const [creating, setCreating] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.profiles.list(),
  })

  const profiles: Profile[] = Array.isArray((data as any)?.profiles) ? (data as any).profiles : []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>Profiles</Typography>
        <Button onClick={() => setCreating(true)} variant="contained" size="small">
          Add Profile
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <List disablePadding>
            {profiles.map((p, idx) => {
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const initial = p.name ? p.name.charAt(0).toUpperCase() : 'P'
              return (
                <ListItemButton
                  key={p.id}
                  onClick={() => setEditing(p)}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: color.bg, color: color.text, width: 40, height: 40, fontWeight: 600 }}>
                      {initial}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{p.name}</Typography>
                        {p.isKids && (
                          <Chip label="Kids" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Language: {p.interfaceLanguage ?? 'en'}
                        {p.region && <Box component="span" sx={{ ml: 1 }}>· Region: {p.region.toUpperCase()}</Box>}
                      </Typography>
                    }
                  />
                  <ChevronRightIcon color="action" />
                </ListItemButton>
              )
            })}

            {profiles.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No profiles created yet.</Typography>
              </Box>
            )}
          </List>
        </Card>
      )}

      {creating && (
        <ProfileFormModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
          }}
        />
      )}

      {editing && (
        <ProfileFormModal
          profile={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
          }}
        />
      )}
    </Box>
  )
}

function ProfileFormModal({
  profile,
  onClose,
  onSaved,
}: {
  profile?: Profile
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(profile?.name ?? '')
  const [lang, setLang] = useState(profile?.interfaceLanguage ?? 'en')
  const [region, setRegion] = useState(profile?.region ?? '')
  const [kids, setKids] = useState(profile?.isKids ?? false)
  const [error, setError] = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => api.profiles.create(body),
    onSuccess: onSaved,
    onError: (e: Error) => setError(e.message),
  })

  const updateMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      api.profiles.update(profile!.id as string, body),
    onSuccess: onSaved,
    onError: (e: Error) => setError(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const body: Record<string, unknown> = {
      name: name.trim(),
      interfaceLanguage: lang.trim(),
      isKids: kids,
    }
    if (region.trim()) body.region = region.trim().toUpperCase()
    if (profile) {
      updateMut.mutate(body)
    } else {
      createMut.mutate(body)
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{profile ? 'Edit Profile' : 'New Profile'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            label="Profile Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Family Room, Office"
            margin="dense"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              placeholder="en"
              fullWidth
            />
            <TextField
              label="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="US"
              fullWidth
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox 
                checked={kids} 
                onChange={(e) => setKids(e.target.checked)} 
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Kids Profile</Typography>
                <Typography variant="caption" color="text.secondary">Filter mature content and enforce child ratings</Typography>
              </Box>
            }
            sx={{ mt: 1, p: 1, borderRadius: 2, border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
          />
          {error && <Typography variant="caption" color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMut.isPending || updateMut.isPending}>
            {profile ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
