import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Spinner } from '../../components/Spinner'
import { useState } from 'react'

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
    const updated = addons.map((a, i) => i === index ? { ...a, enabled: !a.enabled } : a)
    saveMut.mutate({ addons: updated })
  }

  const handleRemove = (index: number) => {
    const updated = addons.filter((_, i) => i !== index)
    saveMut.mutate({ addons: updated })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Add-ons</h1>

      {isLoading ? <Spinner /> : (
        <>
          <div className="flex gap-2">
            <Input
              placeholder="Add-on manifest URL"
              value={manifestUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManifestUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAdd} loading={saveMut.isPending}>Add</Button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex flex-col gap-3">
            {addons.length === 0 && (
              <p className="text-sm text-stone-500">No add-ons configured.</p>
            )}
            {addons.map((addon, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{String(addon.manifestUrl ?? '')}</p>
                    <p className="text-xs text-stone-500">
                      {addon.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(i)}>
                      {addon.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleRemove(i)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
