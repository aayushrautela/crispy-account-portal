import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { Profile } from '../../api/types'
import {
  Button,
  Card,
  Chip,
  Spinner,
  Modal,
  Input,
} from '@heroui/react'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const AVATAR_COLORS = [
  { bg: 'bg-primary/15', text: 'text-primary' },
  { bg: 'bg-secondary/15', text: 'text-secondary' },
  { bg: 'bg-danger/15', text: 'text-danger' },
  { bg: 'bg-warning/15', text: 'text-warning' },
  { bg: 'bg-success/15', text: 'text-success' },
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
        <h1 className="text-2xl font-medium">Profiles</h1>
        <Button className="bg-primary text-primary-foreground font-medium" onPress={() => setCreating(true)}>
          Add Profile
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      ) : (
        <Card>
          <Card.Content className="p-0">
            <div className="flex flex-col divide-y divide-default-100">
              {profiles.map((p, idx) => {
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                const initial = p.name ? p.name.charAt(0).toUpperCase() : 'P'
                return (
                  <div
                    key={p.id}
                    onClick={() => setEditing(p)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-default-50 cursor-pointer transition-colors"
                  >
                    <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-semibold ${color.bg} ${color.text}`}>
                      {initial}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{p.name}</h3>
                        {p.isKids && (
                          <Chip size="sm" className="bg-warning/20 text-warning-700 text-[10px] h-5">Kids</Chip>
                        )}
                      </div>
                      <p className="text-sm text-default-500 mt-0.5">
                        Language: {p.interfaceLanguage ?? 'en'}
                        {p.region && <span className="ml-2">· Region: {p.region.toUpperCase()}</span>}
                      </p>
                    </div>

                    <ChevronRightIcon className="text-default-400" />
                  </div>
                )
              })}

              {profiles.length === 0 && (
                <div className="p-8 text-center text-default-500">
                  No profiles created yet.
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {creating && (
        <ProfileFormModal
          isOpen={creating}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
          }}
        />
      )}

      {editing && (
        <ProfileFormModal
          isOpen={!!editing}
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
  isOpen,
  profile,
  onClose,
  onSaved,
}: {
  isOpen: boolean
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
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Dialog>
        <form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Heading>{profile ? 'Edit Profile' : 'New Profile'}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Profile Name</label>
              <Input
                autoFocus
                className="w-full bg-default-100 px-3 py-2 rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Family Room, Office"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium">Language</label>
                <Input
                  className="w-full bg-default-100 px-3 py-2 rounded-lg"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  placeholder="en"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium">Region</label>
                <Input
                  className="w-full bg-default-100 px-3 py-2 rounded-lg uppercase"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="US"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 border border-default-200 rounded-xl hover:bg-default-50 cursor-pointer mt-2 transition-colors">
              <input
                type="checkbox"
                checked={kids}
                onChange={(e) => setKids(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary bg-default-100 border-default-300 rounded focus:ring-primary"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">Kids Profile</span>
                <span className="text-xs text-default-500">Filter mature content and enforce child ratings</span>
              </div>
            </label>

            {error && <span className="text-sm text-danger">{error}</span>}
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-default-100" onPress={onClose}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-medium" isDisabled={createMut.isPending || updateMut.isPending}>
              {profile ? 'Save' : 'Create'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Dialog>
    </Modal>
  )
}
