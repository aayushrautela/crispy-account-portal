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
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-medium">Imports</h1>

      {/* Profile Filter Chips */}
      {profiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => {
            const isActive = selectedId === p.id
            return (
              <Chip
                key={p.id}
                className={`cursor-pointer font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'bg-transparent border border-default-200 text-default-700'}`}
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
    <div className="flex flex-col gap-6">
      {/* Provider Connection Rows */}
      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
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
                <div
                  key={ps.provider}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-4"
                >
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white" style={{ backgroundColor: providerStyle.bg }}>
                    {providerStyle.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium capitalize text-foreground">{ps.provider}</h3>
                      <Chip 
                        size="sm" 
                        className={`h-5 text-[10px] ${isConnected || isPending ? 'border border-default-200 bg-transparent' : 'bg-default-100'} ${isConnected ? 'text-success' : isPending ? 'text-warning' : 'text-default-500'}`}
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

                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
                        className="border border-default-200 bg-transparent text-default-700"
                        size="sm"
                        isDisabled={connectMut.isPending}
                        onPress={() => connectMut.mutate({ provider: ps.provider, action: 'reconnect' })}
                      >
                        Reconnect
                      </Button>
                    )}
                    {ps.primaryAction === 'connect' && (
                      <Button
                        className="border border-default-200 bg-transparent text-default-700"
                        size="sm"
                        isDisabled={connectMut.isPending}
                        onPress={() => connectMut.mutate({ provider: ps.provider, action: 'connect' })}
                      >
                        Connect
                      </Button>
                    )}
                    {ps.canDisconnect && (
                      <Button
                        className="bg-transparent text-danger"
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
