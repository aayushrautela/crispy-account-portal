import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Spinner } from '../../components/Spinner'
import { useState } from 'react'
import type { PatToken } from '../../api/types'

export function ApiKeysPage() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['pat'],
    queryFn: () => api.pat.list(),
  })

  const tokens: PatToken[] = Array.isArray((data as any)?.items) ? (data as any).items : []

  const revokeMut = useMutation({
    mutationFn: async (id: string) => api.pat.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pat'] }),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">API Keys</h1>
        <Button onClick={() => setCreating(true)}>Create key</Button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col gap-3">
          {tokens.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-stone-500">
                    Created {new Date(t.createdAt).toLocaleDateString()}
                    {t.lastUsedAt ? ` · Last used ${new Date(t.lastUsedAt).toLocaleDateString()}` : ' · Never used'}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  loading={revokeMut.isPending}
                  onClick={() => revokeMut.mutate(t.id)}
                >
                  Revoke
                </Button>
              </div>
            </Card>
          ))}
          {tokens.length === 0 && (
            <p className="text-sm text-stone-500">No API keys yet.</p>
          )}
        </div>
      )}

      {creating && <CreateTokenModal onClose={() => setCreating(false)} />}
    </div>
  )
}

function CreateTokenModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [plaintext, setPlaintext] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: async (tokenName: string) => api.pat.create({ name: tokenName }),
    onSuccess: (result) => {
      const data = result as any
      const token = data?.token
      if (token?.plaintext) {
        setPlaintext(token.plaintext)
      } else {
        queryClient.invalidateQueries({ queryKey: ['pat'] })
        onClose()
      }
    },
    onError: (e: Error) => setError(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMut.mutate(name.trim())
  }

  return (
    <Modal title="Create API key" onClose={onClose} open>
      {plaintext ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-yellow-400 font-medium">Copy this key now. You will not see it again.</p>
          <div className="rounded-lg bg-stone-800 p-3 text-xs font-mono break-all select-all">{plaintext}</div>
          <Button onClick={() => { queryClient.invalidateQueries({ queryKey: ['pat'] }); onClose() }}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Key name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required placeholder="e.g. my-app" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending}>Create</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
