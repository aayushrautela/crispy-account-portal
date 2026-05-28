import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Spinner } from '../../components/Spinner'
import { ExpandableSection } from '../../components/ExpandableSection'
import { useState } from 'react'
import type { ProviderState, ImportJob } from '../../api/types'

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
      <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Imports</h1>

      {/* Profile Filter Chips */}
      {profiles.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {profiles.map((p) => {
            const isActive = selectedId === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#a8c7fa] text-[#062e6f]'
                    : 'bg-m3-surface text-stone-400 border border-m3-border/20 hover:text-stone-200'
                }`}
              >
                {p.name}
              </button>
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

  if (isLoading) return <Spinner />

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
      <Card noPadding>
        <div className="py-1">
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
                className="px-5 py-3.5 hover:bg-m3-hover/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: providerStyle.bg }}
                  >
                    {providerStyle.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium capitalize text-stone-100 font-sans">
                        {ps.provider}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isConnected
                            ? 'bg-m3-green/10 text-m3-green'
                            : isPending
                            ? 'bg-m3-orange/10 text-m3-orange'
                            : 'bg-stone-800 text-stone-500'
                        }`}
                      >
                        {ps.connectionState?.replace('_', ' ') || 'disconnected'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-sans mt-0.5">
                      {ps.statusLabel}
                      {ps.externalUsername && (
                        <span className="ml-1.5">as <strong className="text-stone-300 font-medium">{ps.externalUsername}</strong></span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {ps.canImport && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={connectMut.isPending}
                        onClick={() => connectMut.mutate({ provider: ps.provider, action: 'import' })}
                      >
                        Import
                      </Button>
                    )}
                    {ps.canReconnect && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={connectMut.isPending}
                        onClick={() => connectMut.mutate({ provider: ps.provider, action: 'reconnect' })}
                      >
                        Reconnect
                      </Button>
                    )}
                    {ps.primaryAction === 'connect' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={connectMut.isPending}
                        onClick={() => connectMut.mutate({ provider: ps.provider, action: 'connect' })}
                      >
                        Connect
                      </Button>
                    )}
                    {ps.canDisconnect && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={disconnectMut.isPending}
                        onClick={() => disconnectMut.mutate(ps.provider)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {providerStates.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-stone-500 font-sans">No providers available.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Import History — collapsible */}
      {jobs.length > 0 && (
        <ExpandableSection title="Import History" count={jobs.length}>
          <Card noPadding>
            <div className="py-1">
              {jobs.slice(0, 20).map((job) => {
                const isSuccess = job.status === 'succeeded'
                const isFailed = job.status === 'failed'
                const isRunning = job.status === 'running'

                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        isSuccess
                          ? 'bg-m3-green'
                          : isFailed
                          ? 'bg-red-400'
                          : isRunning
                          ? 'bg-m3-blue animate-pulse'
                          : 'bg-stone-600'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-100 font-sans truncate">
                        {job.provider} sync
                      </p>
                      {job.errorMessage && (
                        <p className="text-xs text-red-400 font-sans truncate mt-0.5">
                          {job.errorMessage}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-sans shrink-0 capitalize">
                      {job.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </ExpandableSection>
      )}
    </div>
  )
}
