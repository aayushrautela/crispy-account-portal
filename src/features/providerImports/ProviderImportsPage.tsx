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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Imports</h1>
        <p className="text-xs text-stone-400 font-sans tracking-wide">
          Connect and sync with external providers like Trakt and Simkl.
        </p>
      </div>

      {/* Profile Filter Chips */}
      <div className="flex gap-2.5 flex-wrap border-b border-m3-border/10 pb-4">
        {profiles.map((p) => {
          const isActive = selectedId === p.id
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProfileId(p.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wider font-sans transition-all duration-200 ${
                isActive
                  ? 'bg-[#a8c7fa] text-[#062e6f] shadow-sm font-bold scale-[1.02]'
                  : 'bg-m3-surface text-stone-400 border border-m3-border/20 hover:text-stone-200 hover:border-stone-500'
              }`}
            >
              {p.name.toUpperCase()}
            </button>
          )
        })}
        {profiles.length === 0 && (
          <p className="text-xs text-stone-500 font-sans">No profiles yet.</p>
        )}
      </div>

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

  return (
    <div className="flex flex-col gap-6">

      {/* Provider Connection Tiles */}
      <Card noPadding>
        {providerStates.map((ps) => {
          const isConnected = ps.connectionState === 'connected'
          const isPending = ps.connectionState === 'pending_authorization'

          return (
            <div
              key={ps.provider}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-m3-border/10 last:border-none hover:bg-m3-hover/[0.15] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold capitalize text-stone-100 font-sans tracking-wide">
                    {ps.provider}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-sans tracking-wider uppercase border ${
                      isConnected
                        ? 'bg-m3-green/10 text-m3-green border-m3-green/20'
                        : isPending
                        ? 'bg-m3-orange/10 text-m3-orange border-m3-orange/20 animate-pulse'
                        : 'bg-stone-800 text-stone-500 border-stone-700'
                    }`}
                  >
                    {ps.connectionState?.replace('_', ' ') || 'disconnected'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-sans mt-1">
                  {ps.statusLabel}
                  {ps.externalUsername && (
                    <>
                      <span className="text-stone-600 font-light mx-1.5">·</span>
                      <span>as <strong className="text-stone-300 font-medium">{ps.externalUsername}</strong></span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-2 self-end sm:self-center">
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
                    variant="danger"
                    size="sm"
                    loading={disconnectMut.isPending}
                    onClick={() => disconnectMut.mutate(ps.provider)}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        {providerStates.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-xs text-stone-500 font-sans">No providers available.</p>
          </div>
        )}
      </Card>

      {/* Import Jobs — collapsible */}
      {jobs.length > 0 && (
        <ExpandableSection title="Import History" count={jobs.length}>
          <Card noPadding>
            {jobs.slice(0, 20).map((job) => {
              const isSuccess = job.status === 'succeeded'
              const isFailed = job.status === 'failed'
              const isRunning = job.status === 'running'

              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 border-b border-m3-border/10 last:border-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        isSuccess
                          ? 'bg-m3-green shadow-[0_0_8px_#34a853]'
                          : isFailed
                          ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                          : isRunning
                          ? 'bg-m3-blue shadow-[0_0_8px_#1a73e8] animate-pulse'
                          : 'bg-stone-600'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold capitalize text-stone-100 font-sans truncate">
                        {job.provider} sync
                      </p>
                      {job.errorMessage && (
                        <p className="text-[10px] text-red-400 font-sans truncate mt-0.5">
                          {job.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-400 uppercase font-sans tracking-wide shrink-0">
                    {job.status}
                  </span>
                </div>
              )
            })}
          </Card>
        </ExpandableSection>
      )}
    </div>
  )
}
