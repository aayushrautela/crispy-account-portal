import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { ProviderState, ImportJob } from '../../api/types'
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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export function ProviderImportsPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.profiles.list(),
  })
  const profiles: { id: string; name: string }[] = Array.isArray((profilesData as any)?.profiles)
    ? (profilesData as any).profiles
    : []

  const selectedId = selectedProfileId ?? (profiles[0]?.id ?? null)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 500 }}>Imports</Typography>

      {/* Profile Filter Chips */}
      {profiles.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {profiles.map((p) => {
            const isActive = selectedId === p.id
            return (
              <Chip
                key={p.id}
                label={p.name}
                onClick={() => setSelectedProfileId(p.id)}
                color={isActive ? 'primary' : 'default'}
                variant={isActive ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500 }}
              />
            )
          })}
        </Box>
      )}

      {selectedId && <ProviderImportView profileId={selectedId} />}
    </Box>
  )
}

function ProviderImportView({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['importConnections', profileId],
    queryFn: () => api.providerImports.listConnections(profileId),
    refetchInterval: 5000,
  })

  const { data: jobsData } = useQuery({
    queryKey: ['importJobs', profileId],
    queryFn: () => api.providerImports.listJobs(profileId),
    refetchInterval: 5000,
  })

  const connectMut = useMutation({
    mutationFn: async ({ provider, action }: { provider: string; action: string }) =>
      api.providerImports.startImport(profileId, provider, action),
    onSuccess: (result) => {
      const res = result as any
      if (res?.authUrl) {
        window.open(res.authUrl, '_blank', 'noopener,noreferrer')
      }
      queryClient.invalidateQueries({ queryKey: ['importConnections', profileId] })
      queryClient.invalidateQueries({ queryKey: ['importJobs', profileId] })
    },
  })

  const disconnectMut = useMutation({
    mutationFn: async (provider: string) => api.providerImports.disconnect(profileId, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['importConnections', profileId] })
      queryClient.invalidateQueries({ queryKey: ['importJobs', profileId] })
    },
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const providerStates: ProviderState[] = Array.isArray((data as any)?.providerStates)
    ? (data as any).providerStates
    : []
  const jobs: ImportJob[] = Array.isArray((jobsData as any)?.jobs) ? (jobsData as any).jobs : []

  const PROVIDER_ICONS: Record<string, { bg: string; icon: React.ReactNode }> = {
    trakt: {
      bg: '#e01e1e',
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    simkl: {
      bg: '#1a73e8',
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
        </svg>
      ),
    },
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Provider Connection Rows */}
      <Card variant="outlined">
        <List disablePadding>
          {providerStates.map((ps) => {
            const isConnected = ps.connectionState === 'connected'
            const isPending = ps.connectionState === 'pending_authorization'
            const providerStyle = PROVIDER_ICONS[ps.provider] || {
              bg: '#5f6368',
              icon: (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              ),
            }

            return (
              <ListItem
                key={ps.provider}
                sx={{ py: 2, px: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <Avatar sx={{ bgcolor: providerStyle.bg, width: 40, height: 40 }}>
                    {providerStyle.icon}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                        {ps.provider}
                      </Typography>
                      <Chip 
                        label={ps.connectionState?.replace('_', ' ') || 'disconnected'} 
                        size="small" 
                        color={isConnected ? 'success' : isPending ? 'warning' : 'default'}
                        variant={isConnected || isPending ? 'outlined' : 'filled'}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {ps.statusLabel}
                      {ps.externalUsername && (
                        <Box component="span" sx={{ ml: 1 }}>
                          as <Typography component="span" sx={{ fontWeight: 500 }} color="text.primary">{ps.externalUsername}</Typography>
                        </Box>
                      )}
                    </Typography>
                  }
                  sx={{ flex: 1, m: 0 }}
                />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: { xs: 1, sm: 0 } }}>
                  {ps.canImport && (
                    <Button
                      variant="contained"
                      size="small"
                      disabled={connectMut.isPending}
                      onClick={() => connectMut.mutate({ provider: ps.provider, action: 'import' })}
                    >
                      Import
                    </Button>
                  )}
                  {ps.canReconnect && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={connectMut.isPending}
                      onClick={() => connectMut.mutate({ provider: ps.provider, action: 'reconnect' })}
                    >
                      Reconnect
                    </Button>
                  )}
                  {ps.primaryAction === 'connect' && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={connectMut.isPending}
                      onClick={() => connectMut.mutate({ provider: ps.provider, action: 'connect' })}
                    >
                      Connect
                    </Button>
                  )}
                  {ps.canDisconnect && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      disabled={disconnectMut.isPending}
                      onClick={() => disconnectMut.mutate(ps.provider)}
                    >
                      Disconnect
                    </Button>
                  )}
                </Box>
              </ListItem>
            )
          })}
          {providerStates.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No providers available.</Typography>
            </Box>
          )}
        </List>
      </Card>

      {/* Import History */}
      {jobs.length > 0 && (
        <Accordion variant="outlined" sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 500 }}>Import History</Typography>
              <Chip label={jobs.length.toString()} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List disablePadding>
              {jobs.slice(0, 20).map((job) => {
                const isSuccess = job.status === 'succeeded'
                const isFailed = job.status === 'failed'
                const isRunning = job.status === 'running'

                return (
                  <ListItem key={job.id} sx={{ px: 3, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: isSuccess ? 'success.main' : isFailed ? 'error.main' : isRunning ? 'primary.main' : 'text.disabled',
                          animation: isRunning ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: .5 }
                          }
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography sx={{ fontSize: '0.875rem' }}>{job.provider} sync</Typography>}
                      secondary={
                        job.errorMessage ? <Typography variant="caption" color="error">{job.errorMessage}</Typography> : null
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {job.status}
                    </Typography>
                  </ListItem>
                )
              })}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}
