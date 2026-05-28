import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExtensionIcon from '@mui/icons-material/Extension'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const INITIAL_SHOW = 4

export function AddonsPage() {
  const queryClient = useQueryClient()
  const [manifestUrl, setManifestUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['accountSettings'],
    queryFn: () => api.account.getSettings(),
  })

  const addons: Record<string, unknown>[] = Array.isArray((settings as any)?.settings?.addons)
    ? (settings as any).settings.addons
    : []

  const saveMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => api.account.patchSettings(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountSettings'] })
      setManifestUrl('')
      setError(null)
    },
    onError: (e: Error) => setError(e.message),
  })

  const handleAdd = () => {
    if (!manifestUrl.trim()) return
    const updated = [...addons, { manifestUrl: manifestUrl.trim(), enabled: true }]
    saveMut.mutate({ addons: updated })
  }

  const handleToggle = (index: number) => {
    const updated = addons.map((a, i) => (i === index ? { ...a, enabled: !a.enabled } : a))
    saveMut.mutate({ addons: updated })
  }

  const handleRemove = (index: number) => {
    const updated = addons.filter((_, i) => i !== index)
    saveMut.mutate({ addons: updated })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 500 }}>Add-ons</Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Add-on Input */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Manifest URL"
                value={manifestUrl}
                onChange={(e) => setManifestUrl(e.target.value)}
              />
              <Button 
                variant="contained"
                onClick={handleAdd}
                disabled={saveMut.isPending || !manifestUrl.trim()}
                sx={{ minWidth: 100 }}
              >
                Add
              </Button>
            </Box>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </Box>

          {/* Addons List */}
          {addons.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 4, py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No add-ons installed yet.</Typography>
            </Card>
          ) : addons.length <= INITIAL_SHOW ? (
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <List disablePadding>
                {addons.map((addon, i) => (
                  <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                ))}
              </List>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <List disablePadding>
                  {addons.slice(0, INITIAL_SHOW).map((addon, i) => (
                    <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                  ))}
                </List>
              </Card>
              
              <Accordion variant="outlined" sx={{ borderRadius: '16px !important', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>Show more</Typography>
                    <Chip label={(addons.length - INITIAL_SHOW).toString()} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {addons.slice(INITIAL_SHOW).map((addon, i) => (
                      <AddonRow key={i + INITIAL_SHOW} addon={addon} index={i + INITIAL_SHOW} onToggle={handleToggle} onRemove={handleRemove} />
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

function AddonRow({
  addon,
  index,
  onToggle,
  onRemove,
}: {
  addon: Record<string, unknown>
  index: number
  onToggle: (i: number) => void
  onRemove: (i: number) => void
}) {
  const isEnabled = addon.enabled
  const url = String(addon.manifestUrl ?? '')

  return (
    <ListItem sx={{ py: 2, px: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
      <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
        <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40, color: '#fff' }}>
          <ExtensionIcon />
        </Avatar>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: '100%', sm: 300, md: 400 } }}>
              {url}
            </Typography>
            <Chip 
              label={isEnabled ? 'on' : 'off'} 
              size="small" 
              color={isEnabled ? 'success' : 'default'}
              variant={isEnabled ? 'outlined' : 'filled'}
              sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0 }}
            />
          </Box>
        }
        sx={{ flex: 1, m: 0, minWidth: 0 }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, mt: { xs: 1, sm: 0 } }}>
        <Button variant="outlined" size="small" onClick={() => onToggle(index)} color="inherit">
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="outlined" size="small" onClick={() => onRemove(index)} color="inherit">
          Remove
        </Button>
      </Box>
    </ListItem>
  )
}
