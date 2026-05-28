import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import {
  Button,
  Card,
  Chip,
  Spinner,
  Input,
  Accordion,
} from '@heroui/react'
import { ExtensionIcon } from '../../icons'

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
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-medium">Add-ons</h1>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Add-on Input */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                className="w-full bg-default-100 px-3 py-2 rounded-lg"
                placeholder="Manifest URL"
                value={manifestUrl}
                onChange={(e) => setManifestUrl(e.target.value)}
              />
              <Button 
                className="bg-primary text-primary-foreground font-medium shrink-0 h-auto py-2"
                onPress={handleAdd}
                isDisabled={saveMut.isPending || !manifestUrl.trim()}
              >
                Add Add-on
              </Button>
            </div>
            {error && <span className="text-sm text-danger">{error}</span>}
          </div>

          {/* Addons List */}
          {addons.length === 0 ? (
            <Card className="py-12">
              <Card.Content className="flex justify-center items-center text-default-500">
                No add-ons installed yet.
              </Card.Content>
            </Card>
          ) : addons.length <= INITIAL_SHOW ? (
            <Card>
              <Card.Content className="p-0">
                <div className="flex flex-col divide-y divide-default-100">
                  {addons.map((addon, i) => (
                    <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                  ))}
                </div>
              </Card.Content>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              <Card>
                <Card.Content className="p-0">
                  <div className="flex flex-col divide-y divide-default-100">
                    {addons.slice(0, INITIAL_SHOW).map((addon, i) => (
                      <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                    ))}
                  </div>
                </Card.Content>
              </Card>
              
              <Accordion className="bg-content1 rounded-xl shadow-sm border border-default-200">
                <Accordion.Item>
                  <Accordion.Heading>
                    <Accordion.Trigger className="flex items-center gap-2 px-4 py-3">
                      <span className="font-medium">Show more</span>
                      <Chip size="sm" className="bg-default-100">{addons.length - INITIAL_SHOW}</Chip>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <div className="flex flex-col divide-y divide-default-100 border-t border-default-100">
                      {addons.slice(INITIAL_SHOW).map((addon, i) => (
                        <AddonRow key={i + INITIAL_SHOW} addon={addon} index={i + INITIAL_SHOW} onToggle={handleToggle} onRemove={handleRemove} />
                      ))}
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          )}
        </div>
      )}
    </div>
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3">
      <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: '#fef7e0', color: '#c5630c' }}>
        <ExtensionIcon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-md">
            {url}
          </p>
          <Chip 
            size="sm" 
            className={`h-5 text-[10px] ${isEnabled ? 'bg-success/10 text-success' : 'bg-default-200/50 text-default-500'}`}
          >
            {isEnabled ? 'on' : 'off'}
          </Chip>
        </div>
      </div>

      <div className="flex gap-2 mt-2 sm:mt-0">
        <Button 
          className="bg-default-200/50 text-default-600" 
          size="sm" 
          onPress={() => onToggle(index)}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button 
          className="bg-danger/10 text-danger" 
          size="sm" 
          onPress={() => onRemove(index)}
        >
          Remove
        </Button>
      </div>
    </div>
  )
}
