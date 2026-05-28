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
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Add-ons</h1>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-4">

          {/* Add-on Input */}
          <div className="flex gap-3">
            <Input
              placeholder="Manifest URL"
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
              <div className="py-1">
                {addons.map((addon, i) => (
                  <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                ))}
              </div>
            </Card>
          ) : (
            <>
              <Card noPadding>
                <div className="py-1">
                  {addons.slice(0, INITIAL_SHOW).map((addon, i) => (
                    <AddonRow key={i} addon={addon} index={i} onToggle={handleToggle} onRemove={handleRemove} />
                  ))}
                </div>
              </Card>
              <ExpandableSection title="Show more" count={addons.length - INITIAL_SHOW} defaultExpanded={false}>
                <Card noPadding>
                  <div className="py-1">
                    {addons.slice(INITIAL_SHOW).map((addon, i) => (
                      <AddonRow key={i + INITIAL_SHOW} addon={addon} index={i + INITIAL_SHOW} onToggle={handleToggle} onRemove={handleRemove} />
                    ))}
                  </div>
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
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-m3-hover/30 transition-colors">
      <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-m3-orange/10">
        <svg className="w-5 h-5 text-m3-orange" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-stone-100 font-sans truncate max-w-[80%]">{url}</p>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              isEnabled
                ? 'bg-m3-green/10 text-m3-green'
                : 'bg-stone-800 text-stone-500'
            }`}
          >
            {isEnabled ? 'on' : 'off'}
          </span>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="secondary" size="sm" onClick={() => onToggle(index)}>
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </div>
    </div>
  )
}
