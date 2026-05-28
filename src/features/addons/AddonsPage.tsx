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
    const updated = addons.map((a, i) => (i === index ? { ...a, enabled: !a.enabled } : a))
    saveMut.mutate({ addons: updated })
  }

  const handleRemove = (index: number) => {
    const updated = addons.filter((_, i) => i !== index)
    saveMut.mutate({ addons: updated })
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Add-ons</h1>
        <p className="text-xs text-stone-400 font-sans tracking-wide">
          Extend Crispy with third-party extensions, custom metadata feeds, and libraries.
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Add-on Creation Form Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter add-on manifest URL (https://...)"
              value={manifestUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManifestUrl(e.target.value)}
              className="flex-1 font-sans text-xs"
            />
            <Button onClick={handleAdd} loading={saveMut.isPending} className="sm:w-auto">
              Add Extension
            </Button>
          </div>
          
          {error && <p className="text-xs text-red-400 font-sans ml-3">{error}</p>}

          {/* Grouped Addons List */}
          <Card noPadding>
            {addons.map((addon, i) => {
              const isEnabled = addon.enabled
              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-m3-border/10 last:border-none hover:bg-m3-hover/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-stone-100 font-sans truncate max-w-[85%]">
                        {String(addon.manifestUrl ?? '')}
                      </p>
                      
                      {/* Active Chip */}
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full font-sans tracking-wider uppercase border ${
                          isEnabled
                            ? 'bg-m3-green/10 text-m3-green border-m3-green/20'
                            : 'bg-stone-800 text-stone-500 border-stone-700'
                        }`}
                      >
                        {isEnabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-stone-500 font-sans mt-1">
                      Manifest configuration loaded
                    </p>
                  </div>
                  
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button variant="secondary" size="sm" onClick={() => handleToggle(i)}>
                      {isEnabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleRemove(i)}>
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {addons.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs text-stone-500 font-sans">No add-ons configured yet.</p>
              </div>
            )}
          </Card>
          
        </div>
      )}
    </div>
  )
}
