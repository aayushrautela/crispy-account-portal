import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { PatToken } from '../../api/types'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import KeyIcon from '@mui/icons-material/Key'

const INITIAL_SHOW = 4

export function ApiKeysPage() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<PatToken | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pat'],
    queryFn: () => api.pat.list(),
  })

  const tokens: PatToken[] = Array.isArray((data as any)?.items) ? (data as any).items : []

  const revokeMut = useMutation({
    mutationFn: async (id: string) => api.pat.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pat'] })
      setRevoking(null)
    },
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>API Keys</Typography>
        <Button onClick={() => setCreating(true)} variant="contained" size="small">
          Create Key
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : tokens.length === 0 ? (
        <Card variant="outlined" sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <KeyIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="body2" color="text.secondary">No API keys yet.</Typography>
        </Card>
      ) : tokens.length <= INITIAL_SHOW ? (
        <Card variant="outlined">
          <List disablePadding>
            {tokens.map((t) => (
              <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
            ))}
          </List>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined">
            <List disablePadding>
              {tokens.slice(0, INITIAL_SHOW).map((t) => (
                <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
              ))}
            </List>
          </Card>
          <Accordion variant="outlined" sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>Show more</Typography>
                <Chip label={(tokens.length - INITIAL_SHOW).toString()} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List disablePadding>
                {tokens.slice(INITIAL_SHOW).map((t) => (
                  <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {creating && <CreateTokenModal onClose={() => setCreating(false)} />}

      {revoking && (
        <Dialog open onClose={() => setRevoking(null)}>
          <DialogTitle>Revoke API Key</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Revoke <Typography component="span" sx={{ fontWeight: 500 }} color="text.primary">{revoking.name}</Typography>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setRevoking(null)} color="inherit">Cancel</Button>
            <Button onClick={() => revokeMut.mutate(revoking.id)} variant="contained" color="error" disabled={revokeMut.isPending}>
              Revoke
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

function TokenRow({ token, onRevoke }: { token: PatToken; onRevoke: () => void }) {
  return (
    <ListItem sx={{ py: 2, px: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
      <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
        <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40, color: '#fff' }}>
          <SecurityIcon />
        </Avatar>
      </ListItemIcon>
      
      <ListItemText
        primary={<Typography sx={{ fontWeight: 500 }}>{token.name}</Typography>}
        secondary={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Created {new Date(token.createdAt).toLocaleDateString()}
            <Box component="span" sx={{ ml: 1 }}>
              · {token.lastUsedAt ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}` : 'Never used'}
            </Box>
          </Typography>
        }
        sx={{ flex: 1, m: 0 }}
      />

      <Box sx={{ flexShrink: 0, mt: { xs: 1, sm: 0 } }}>
        <Button variant="outlined" size="small" onClick={onRevoke} color="inherit">
          Revoke
        </Button>
      </Box>
    </ListItem>
  )
}

function CreateTokenModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [plaintext, setPlaintext] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: async (tokenName: string) => api.pat.create({ name: tokenName }),
    onSuccess: (result) => {
      const data = result as any
      const token = data?.token
      if (token?.plaintext) {
        setPlaintext(token.plaintext)
      } else {
        queryClient.invalidateQueries({ queryKey: ['pat'] })
        onClose()
      }
    },
    onError: (e: Error) => setError(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMut.mutate(name.trim())
  }

  return (
    <Dialog open onClose={plaintext ? undefined : onClose} fullWidth maxWidth="sm">
      {plaintext ? (
        <>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'warning.main', color: 'warning.contrastText', opacity: 0.9 }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold' }}>Copy now</Typography>
              <Typography variant="body2">This token won't be shown again.</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider', fontFamily: 'monospace', wordBreak: 'break-all', userSelect: 'all', color: 'primary.main' }}>
              {plaintext}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              variant="contained"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['pat'] })
                onClose()
              }}
            >
              Done
            </Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Token Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. desktop-app, cron-import"
              margin="dense"
            />
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMut.isPending}>
              Create
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  )
}
