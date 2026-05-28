import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Spinner } from '../../components/Spinner'
import { ExpandableSection } from '../../components/ExpandableSection'
import { useState } from 'react'

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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Add-ons</h1>
        <p className="text-xs text-stone-400 font-sans tracking-wide">
          Install and manage third-party extensions.
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">

          {/* Add-on Form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Manifest URL (https://...)"
              value={manifestUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManifestUrl(e.target.value)}
              className="flex-1 font-sans text-xs"
            />
            <Button onClick={handleAdd} loading={saveMut.isPending} className="sm:w-auto">
              Add
            </Button>
          </div>

          {error && <p className="text-xs text-red-400 font-sans">{error}</p>}

          {/* Addons List */}
          {addons.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-sm text-stone-500 font-sans">No add-ons installed yet.</p>
            </Card>
          ) : addons.length <= INITIAL_SHOW ? (
            <Card noPadding>
              {addons.map((addon, i) => (
                <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
              ))}
            </Card>
          ) : (
            <>
              <Card noPadding>
                {addons.slice(0, INITIAL_SHOW).map((addon, i) => (
                  <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                ))}
              </Card>
              <ExpandableSection title="Show more" count={addons.length - INITIAL_SHOW} defaultExpanded={false}>
                <Card noPadding>
                  {addons.slice(INITIAL_SHOW).map((addon, i) => (
                    <AddonRow key={i + INITIAL_SHOW} addon={addon} index={i + INITIAL_SHOW} onToggle={handleToggle} onRemove={handleRemove} />
                  ))}
                </Card>
              </ExpandableSection>
            </>
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-m3-border/10 last:border-none hover:bg-m3-hover/30 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-stone-100 font-sans truncate max-w-[80%]">{url}</p>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-sans tracking-wider uppercase border ${
              isEnabled
                ? 'bg-m3-green/10 text-m3-green border-m3-green/20'
                : 'bg-stone-800 text-stone-500 border-stone-700'
            }`}
          >
            {isEnabled ? 'on' : 'off'}
          </span>
        </div>
      </div>
      <div className="flex gap-2 self-end sm:self-center shrink-0">
        <Button variant="secondary" size="sm" onClick={() => onToggle(index)}>
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="danger" size="sm" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </div>
    </div>
  )
}
