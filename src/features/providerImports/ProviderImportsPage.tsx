import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Spinner } from '../../components/Spinner'
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
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Provider Imports</h1>

      <div className="flex gap-2 flex-wrap">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProfileId(p.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              selectedId === p.id ? 'bg-stone-700 text-stone-100' : 'bg-stone-800/50 text-stone-500 hover:text-stone-300'
            }`}
          >
            {p.name}
          </button>
        ))}
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
    <div className="flex flex-col gap-4">
      {providerStates.map((ps) => (
        <Card key={ps.provider}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium capitalize">{ps.provider}</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {ps.statusLabel}
                {ps.externalUsername ? ` · ${ps.externalUsername}` : ''}
              </p>
              {ps.connectionState === 'pending_authorization' && (
                <p className="text-xs text-yellow-400 mt-1">Waiting for authorization...</p>
              )}
            </div>
            <div className="flex gap-2">
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
        </Card>
      ))}

      {jobs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-stone-400 mb-2">Import jobs</h3>
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-stone-800 bg-stone-900/30 px-4 py-2 text-sm">
                <span className="text-stone-500 capitalize">{job.provider}</span>
                <span className={`ml-3 text-xs ${
                  job.status === 'succeeded' ? 'text-green-400'
                  : job.status === 'failed' ? 'text-red-400'
                  : job.status === 'running' ? 'text-blue-400'
                  : 'text-stone-500'
                }`}>
                  {job.status}
                </span>
                {job.errorMessage && <span className="ml-2 text-xs text-red-400">{job.errorMessage}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
