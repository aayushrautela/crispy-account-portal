import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Spinner } from '../../components/Spinner'
import { Modal } from '../../components/Modal'
import { useState } from 'react'
import type { Profile } from '../../api/types'

export function ProfilesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Profile | null>(null)
  const [creating, setCreating] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.profiles.list(),
  })

  const profiles: Profile[] = Array.isArray((data as any)?.profiles) ? (data as any).profiles : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profiles</h1>
        <Button onClick={() => setCreating(true)}>Add profile</Button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col gap-3">
          {profiles.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-stone-500">
                    {p.interfaceLanguage ?? 'en'} {p.isKids ? '· Kids' : ''}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
              </div>
            </Card>
          ))}
          {profiles.length === 0 && (
            <p className="text-sm text-stone-500">No profiles yet.</p>
          )}
        </div>
      )}

      {creating && (
        <ProfileFormModal
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); queryClient.invalidateQueries({ queryKey: ['profiles'] }) }}
        />
      )}

      {editing && (
        <ProfileFormModal
          profile={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); queryClient.invalidateQueries({ queryKey: ['profiles'] }) }}
        />
      )}
    </div>
  )
}

function ProfileFormModal({ profile, onClose, onSaved }: { profile?: Profile; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(profile?.name ?? '')
  const [lang, setLang] = useState(profile?.interfaceLanguage ?? 'en')
  const [region, setRegion] = useState(profile?.region ?? '')
  const [kids, setKids] = useState(profile?.isKids ?? false)
  const [error, setError] = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => api.profiles.create(body),
    onSuccess: onSaved,
    onError: (e: Error) => setError(e.message),
  })

  const updateMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => api.profiles.update(profile!.id as string, body),
    onSuccess: onSaved,
    onError: (e: Error) => setError(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const body: Record<string, unknown> = { name: name.trim(), interfaceLanguage: lang, isKids: kids }
    if (region.trim()) body.region = region.trim()
    if (profile) {
      updateMut.mutate(body)
    } else {
      createMut.mutate(body)
    }
  }

  return (
    <Modal title={profile ? 'Edit profile' : 'New profile'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
        <Input label="Language" value={lang} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLang(e.target.value)} placeholder="en" />
        <Input label="Region" value={region} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)} placeholder="US" />
        <label className="flex items-center gap-2 text-sm text-stone-400">
          <input type="checkbox" checked={kids} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKids(e.target.checked)} className="rounded" />
          Kids profile
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
            {profile ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
