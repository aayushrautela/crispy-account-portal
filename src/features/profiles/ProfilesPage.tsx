import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Spinner } from '../../components/Spinner'
import { Modal } from '../../components/Modal'
import { useState } from 'react'
import type { Profile } from '../../api/types'

const AVATAR_COLORS = [
  { bg: 'rgba(26,115,232,0.15)', text: '#8ab4f8' },
  { bg: 'rgba(167,51,255,0.15)', text: '#c58af9' },
  { bg: 'rgba(208,24,132,0.15)', text: '#f28b82' },
  { bg: 'rgba(227,116,0,0.15)', text: '#fcad70' },
  { bg: 'rgba(52,168,83,0.15)', text: '#81c995' },
]

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
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Profiles</h1>
        <Button onClick={() => setCreating(true)} variant="primary" size="sm">
          Add Profile
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <Card noPadding>
          <div className="py-1">
            {profiles.map((p, idx) => {
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const initial = p.name ? p.name.charAt(0).toUpperCase() : 'P'
              return (
                <button
                  key={p.id}
                  onClick={() => setEditing(p)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-m3-hover/50 transition-colors text-left group"
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold font-display shrink-0"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-stone-100 font-sans truncate">{p.name}</h3>
                      {p.isKids && (
                        <span className="text-[10px] font-semibold bg-m3-orange/10 text-m3-orange px-1.5 py-0.5 rounded-full">
                          Kids
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 font-sans mt-0.5">
                      Language: {p.interfaceLanguage ?? 'en'}
                      {p.region && <span className="ml-1.5">· Region: {p.region.toUpperCase()}</span>}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-stone-500 shrink-0 group-hover:text-stone-300 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>
              )
            })}

            {profiles.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-stone-500 font-sans">No profiles created yet.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {creating && (
        <ProfileFormModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
          }}
        />
      )}

      {editing && (
        <ProfileFormModal
          profile={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
          }}
        />
      )}
    </div>
  )
}

function ProfileFormModal({
  profile,
  onClose,
  onSaved,
}: {
  profile?: Profile
  onClose: () => void
  onSaved: () => void
}) {
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
    mutationFn: async (body: Record<string, unknown>) =>
      api.profiles.update(profile!.id as string, body),
    onSuccess: onSaved,
    onError: (e: Error) => setError(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const body: Record<string, unknown> = {
      name: name.trim(),
      interfaceLanguage: lang.trim(),
      isKids: kids,
    }
    if (region.trim()) body.region = region.trim().toUpperCase()
    if (profile) {
      updateMut.mutate(body)
    } else {
      createMut.mutate(body)
    }
  }

  return (
    <Modal title={profile ? 'Edit Profile' : 'New Profile'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Profile Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
          placeholder="e.g. Family Room, Office"
        />
        <div className="flex gap-3">
          <Input
            label="Language"
            value={lang}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLang(e.target.value)}
            placeholder="en"
            className="flex-1"
          />
          <Input
            label="Region"
            value={region}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)}
            placeholder="US"
            className="flex-1 uppercase"
          />
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-m3-hover/50 cursor-pointer transition-colors border border-m3-border/10">
          <input
            type="checkbox"
            checked={kids}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKids(e.target.checked)}
            className="h-4 w-4 rounded border-stone-600 bg-stone-800 accent-[#34a853]"
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-200">Kids Profile</span>
            <span className="text-[10px] text-stone-500">Filter mature content and enforce child ratings</span>
          </div>
        </label>

        {error && <p className="text-xs text-red-400 font-sans">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
            {profile ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
