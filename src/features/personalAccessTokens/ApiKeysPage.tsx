import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Spinner } from '../../components/Spinner'
import { ExpandableSection } from '../../components/ExpandableSection'
import { useState } from 'react'
import type { PatToken } from '../../api/types'

const INITIAL_SHOW = 4

export function ApiKeysPage() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<PatToken | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pat'],
    queryFn: () => api.pat.list(),
  })

  const tokens: PatToken[] = Array.isArray((data as any)?.items) ? (data as any).items : []

  const revokeMut = useMutation({
    mutationFn: async (id: string) => api.pat.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pat'] })
      setRevoking(null)
    },
  })

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">API Keys</h1>
        <Button onClick={() => setCreating(true)} variant="primary" size="sm">
          Create Key
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : tokens.length === 0 ? (
        <Card className="text-center py-10">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            <p className="text-sm text-stone-500 font-sans">No API keys yet.</p>
          </div>
        </Card>
      ) : tokens.length <= INITIAL_SHOW ? (
        <Card noPadding>
          <div className="py-1">
            {tokens.map((t) => (
              <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
            ))}
          </div>
        </Card>
      ) : (
        <>
          <Card noPadding>
            <div className="py-1">
              {tokens.slice(0, INITIAL_SHOW).map((t) => (
                <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
              ))}
            </div>
          </Card>
          <ExpandableSection title="Show more" count={tokens.length - INITIAL_SHOW}>
            <Card noPadding>
              <div className="py-1">
                {tokens.slice(INITIAL_SHOW).map((t) => (
                  <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
                ))}
              </div>
            </Card>
          </ExpandableSection>
        </>
      )}

      {creating && <CreateTokenModal onClose={() => setCreating(false)} />}

      {revoking && (
        <Modal title="Revoke API Key" onClose={() => setRevoking(null)} open>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-300 font-sans">
              Revoke <strong className="text-stone-100">{revoking.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setRevoking(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={revokeMut.isPending}
                onClick={() => revokeMut.mutate(revoking.id)}
              >
                Revoke
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function TokenRow({ token, onRevoke }: { token: PatToken; onRevoke: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-m3-hover/30 transition-colors">
      <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-m3-blue/10">
        <svg className="w-5 h-5 text-m3-blue" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-100 font-sans truncate">{token.name}</p>
        <p className="text-xs text-stone-400 font-sans mt-0.5">
          Created {new Date(token.createdAt).toLocaleDateString()}
          {token.lastUsedAt ? (
            <span className="ml-1.5">· Last used {new Date(token.lastUsedAt).toLocaleDateString()}</span>
          ) : (
            <span className="ml-1.5">· Never used</span>
          )}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRevoke}>
        Revoke
      </Button>
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
    <Modal title="Create API Key" onClose={onClose} open>
      {plaintext ? (
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-m3-orange/10 border border-m3-orange/20 rounded-2xl flex flex-col gap-1">
            <p className="text-xs font-semibold text-m3-orange uppercase tracking-wider font-sans">
              Copy now
            </p>
            <p className="text-xs text-stone-300 font-sans">
              This token won't be shown again.
            </p>
          </div>

          <div className="rounded-2xl bg-m3-bg border border-m3-border/30 p-4 text-xs font-mono break-all select-all text-[#a8c7fa] tracking-wider leading-relaxed">
            {plaintext}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['pat'] })
                onClose()
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Token Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            placeholder="e.g. desktop-app, cron-import"
          />

          {error && <p className="text-xs text-red-400 font-sans">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createMut.isPending}>
              Create
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
