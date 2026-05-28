import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { ProviderState, ImportJob } from '../../api/types'
import {
  Button,
  Card,
  Chip,
  Spinner,
  Accordion,
} from '@heroui/react'
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
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-medium">Imports</h1>

      {/* Profile Filter Chips */}
      {profiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => {
            const isActive = selectedId === p.id
            return (
              <Chip
                key={p.id}
                className={`cursor-pointer font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'bg-default-200/50 text-default-600'}`}
                onClick={() => setSelectedProfileId(p.id)}
              >
                {p.name}
              </Chip>
            )
          })}
        </div>
      )}

      {selectedId && <ProviderImportView profileId={selectedId} />}
    </div>
  )
}

const PROVIDER_ICONS: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  trakt: {
    bg: '#fce8e6',
    color: '#c5221f',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  simkl: {
    bg: '#e8f0fe',
    color: '#1967d2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2.5 6.5c-.8.8-1.7 1.2-2.5 1.2s-1.7-.4-2.5-1.2c-.7-.7-1-1.5-1-2.5 0-.8.3-1.5.8-2 .6-.5 1.3-.8 2.2-.8.8 0 1.6.3 2.2.8.6.5.9 1.2.9 2h-2c0-.3-.1-.5-.3-.7-.2-.2-.4-.3-.7-.3s-.5.1-.7.3c-.2.2-.3.4-.3.7 0 .4.2.7.5 1 .8.6 1.5.8 2.3.8s1.5-.2 2.3-.8c.3-.3.5-.6.5-1 0-.8-.3-1.5-.9-2-.6-.5-1.3-.8-2.2-.8-1 0-1.8.3-2.5 1C9.3 5 9 6 9 7c0 .9.3 1.7.9 2.3.7.6 1.5 1 2.6 1.2v.1c-1 .2-1.9.6-2.5 1.2-.7.6-1 1.4-1 2.4 0 .9.3 1.7 1 2.3.6.6 1.4.9 2.5.9s1.8-.3 2.5-.9c.6-.6 1-1.4 1-2.3h-2c0 .4-.1.7-.3.9-.2.2-.5.3-.8.3s-.6-.1-.8-.3c-.2-.2-.3-.5-.3-.9s.1-.7.3-.9c.2-.2.5-.3.8-.3s.6.1.8.3c.2.2.3.5.3.9.2 0 .4-.1.6-.2.4-.3.6-.7.6-1.2 0-.5-.2-1-.6-1.3-.3-.3-.8-.5-1.4-.5z" />
      </svg>
    ),
  },
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
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    )
  }

  const providerStates: ProviderState[] = Array.isArray((data as any)?.providerStates)
    ? (data as any).providerStates
    : []
  const jobs: ImportJob[] = Array.isArray((jobsData as any)?.jobs) ? (jobsData as any).jobs : []

  return (
    <div className="flex flex-col gap-4">
      {/* Provider Connection Rows */}
      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            {providerStates.map((ps) => {
              const isConnected = ps.connectionState === 'connected'
              const isPending = ps.connectionState === 'pending_authorization'
              const providerIcon = PROVIDER_ICONS[ps.provider]

              return (
                <div
                  key={ps.provider}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: providerIcon?.bg || '#e8e8e8', color: providerIcon?.color || '#5f6368' }}>
                    {providerIcon ? (
                      providerIcon.icon
                    ) : (
                      <span className="text-sm font-medium uppercase">{ps.provider.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium capitalize text-foreground">{ps.provider}</h3>
                      <Chip 
                        size="sm" 
                        className={`h-5 text-[10px] ${isConnected ? 'bg-success/10 text-success' : isPending ? 'bg-warning/10 text-warning' : 'bg-default-200/50 text-default-500'}`}
                      >
                        {ps.connectionState?.replace('_', ' ') || 'disconnected'}
                      </Chip>
                    </div>
                    <p className="text-sm text-default-500 mt-0.5 truncate">
                      {ps.statusLabel}
                      {ps.externalUsername && (
                        <span className="ml-1">
                          as <span className="font-medium text-foreground">{ps.externalUsername}</span>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {ps.canImport && (
                      <Button
                        className="bg-primary text-primary-foreground font-medium"
                        size="sm"
                        isDisabled={connectMut.isPending}
                        onPress={() => connectMut.mutate({ provider: ps.provider, action: 'import' })}
                      >
                        Import
                      </Button>
                    )}
                    {ps.canReconnect && (
                      <Button
                        className="bg-default-200/50 text-default-600"
                        size="sm"
                        isDisabled={connectMut.isPending}
                        onPress={() => connectMut.mutate({ provider: ps.provider, action: 'reconnect' })}
                      >
                        Reconnect
                      </Button>
                    )}
                    {ps.primaryAction === 'connect' && (
                      <Button
                        className="bg-default-200/50 text-default-600"
                        size="sm"
                        isDisabled={connectMut.isPending}
                        onPress={() => connectMut.mutate({ provider: ps.provider, action: 'connect' })}
                      >
                        Connect
                      </Button>
                    )}
                    {ps.canDisconnect && (
                      <Button
                        className="bg-danger/10 text-danger"
                        size="sm"
                        isDisabled={disconnectMut.isPending}
                        onPress={() => disconnectMut.mutate(ps.provider)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            {providerStates.length === 0 && (
              <div className="p-8 text-center text-default-500">
                No providers available.
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Import History */}
      {jobs.length > 0 && (
        <Accordion className="bg-content1 rounded-xl border border-default-200">
          <Accordion.Item>
            <Accordion.Heading>
              <Accordion.Trigger className="flex items-center gap-2 px-4 py-3">
                <span className="font-medium">Import History</span>
                <Chip size="sm" className="bg-default-100">{jobs.length}</Chip>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <div className="flex flex-col divide-y divide-default-100 border-t border-default-100">
                {jobs.slice(0, 20).map((job) => {
                  const isSuccess = job.status === 'succeeded'
                  const isFailed = job.status === 'failed'
                  const isRunning = job.status === 'running'

                  return (
                    <div key={job.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="shrink-0 w-8 flex justify-center">
                        <div 
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSuccess ? 'bg-success' : isFailed ? 'bg-danger' : isRunning ? 'bg-primary animate-pulse' : 'bg-default-300'
                          }`}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium">{job.provider} sync</p>
                        {job.errorMessage && (
                          <p className="text-xs text-danger mt-0.5">{job.errorMessage}</p>
                        )}
                      </div>
                      
                      <span className="text-xs text-default-500 capitalize">
                        {job.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  )
}
