import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { ProviderState, ImportJob } from '../../api/types'
import traktIcon from '../../assets/trakt.svg'
import simklIcon from '../../assets/simkl.svg'
import {
  Button,
  Card,
  Chip,
  Modal,
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
    icon: <img src={traktIcon} alt="Trakt" className="w-5 h-5" />,
  },
  simkl: {
    bg: '#e8f0fe',
    color: '#1967d2',
    icon: <img src={simklIcon} alt="Simkl" className="w-5 h-5" />,
  },
}

function ProviderImportView({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient()
  const [disconnectProvider, setDisconnectProvider] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)

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
      setDisconnectProvider(null)
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

  const connectedProviders = providerStates.filter(
    (ps) => ps.connectionState === 'connected' || ps.connectionState === 'pending_authorization' || ps.connectionState === 'reauthorization_required'
  )
  const disconnectedProviders = providerStates.filter(
    (ps) => ps.connectionState === 'not_connected' || ps.connectionState === null
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Disconnect Confirmation Modal */}
      <Modal isOpen={!!disconnectProvider} onOpenChange={(open) => !open && setDisconnectProvider(null)}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Disconnect Provider</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-default-500 text-sm">
              Are you sure you want to disconnect <span className="font-medium text-foreground capitalize">{disconnectProvider}</span>? You can reconnect at any time.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-default-200/50 text-default-600" onPress={() => setDisconnectProvider(null)}>Cancel</Button>
            <Button className="bg-danger text-danger-foreground" isDisabled={disconnectMut.isPending} onPress={() => disconnectProvider && disconnectMut.mutate(disconnectProvider)}>
              {disconnectMut.isPending ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>

      {/* Connect Provider Modal */}
      <Modal isOpen={showConnectModal} onOpenChange={(open) => !open && setShowConnectModal(false)}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Connect Provider</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {disconnectedProviders.length === 0 ? (
              <p className="text-default-500 text-sm">All providers are already connected.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {disconnectedProviders.map((ps) => {
                  const providerIcon = PROVIDER_ICONS[ps.provider]
                  return (
                    <div key={ps.provider} className="flex items-center gap-3 p-3 rounded-xl bg-default-100/50">
                      <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: providerIcon?.bg || '#e8e8e8', color: providerIcon?.color || '#5f6368' }}>
                        {providerIcon ? providerIcon.icon : (
                          <span className="text-sm font-medium uppercase">{ps.provider.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium capitalize text-foreground">{ps.provider}</h3>
                        <p className="text-xs text-default-500">{ps.statusLabel}</p>
                      </div>
                      <Button
                        className="bg-primary text-primary-foreground font-medium"
                        size="sm"
                        isDisabled={connectMut.isPending}
                        onPress={() => connectMut.mutate({ provider: ps.provider, action: ps.primaryAction })}
                      >
                        Connect
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-default-200/50 text-default-600" onPress={() => setShowConnectModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>

      {/* Connected Providers */}
      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            {connectedProviders.map((ps) => {
              const isConnected = ps.connectionState === 'connected'
              const isPending = ps.connectionState === 'pending_authorization'
              const providerIcon = PROVIDER_ICONS[ps.provider]

              return (
                <div
                  key={ps.provider}
                  className="flex flex-col px-4 py-3 gap-3"
                >
                  <div className="flex items-center gap-4">
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

                    {ps.canDisconnect && (
                      <Button
                        className="bg-danger/10 text-danger"
                        size="sm"
                        isDisabled={disconnectMut.isPending}
                        onPress={() => setDisconnectProvider(ps.provider)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>

                  {(ps.canImport || ps.canReconnect || ps.primaryAction === 'connect') && (
                    <div className="flex gap-2 pl-13">
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
                    </div>
                  )}
                </div>
              )
            })}
            {connectedProviders.length === 0 && (
              <div className="p-8 text-center text-default-500">
                No providers connected yet.
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Connect More Providers Button */}
      {disconnectedProviders.length > 0 && (
        <Button
          className="w-full bg-default-200/50 text-default-600 font-medium"
          onPress={() => setShowConnectModal(true)}
        >
          + Connect Provider
        </Button>
      )}

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
