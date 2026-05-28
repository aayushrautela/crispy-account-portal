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

  const shieldIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">API Keys</h1>
          <p className="text-xs text-stone-400 font-sans tracking-wide">
            Generate personal access tokens to securely query the Crispy REST API via terminal tools.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} variant="primary" size="sm">
          Create Key
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <Card noPadding>
          {tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 px-6 py-4 border-b border-m3-border/10 last:border-none hover:bg-m3-hover/30 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Shield badge */}
                <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-m3-blue/10 text-m3-blue">
                  {shieldIcon}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-100 font-sans tracking-wide truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-stone-400 font-sans mt-0.5 tracking-wide">
                    Created {new Date(t.createdAt).toLocaleDateString()}
                    {t.lastUsedAt ? (
                      <>
                        <span className="text-stone-600 font-light mx-1.5">·</span>
                        <span>Last used {new Date(t.lastUsedAt).toLocaleDateString()}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-stone-600 font-light mx-1.5">·</span>
                        <span>Never used</span>
                      </>
                    )}
                  </p>
                </div>
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
          ))}
          {tokens.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-xs text-stone-500 font-sans">No API keys created yet.</p>
            </div>
          )}
        </Card>
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
    <Modal title="Create API Key" onClose={onClose} open>
      {plaintext ? (
        <div className="flex flex-col gap-4">
          <div className="p-3.5 bg-m3-orange/10 border border-m3-orange/20 rounded-2xl flex flex-col gap-1">
            <p className="text-xs font-semibold text-m3-orange uppercase tracking-wider font-sans">
              Attention Required
            </p>
            <p className="text-xs text-stone-300 font-sans">
              Copy this token key now. For safety, it will not be displayed again.
            </p>
          </div>
          
          <div className="rounded-2xl bg-m3-bg border border-m3-border/30 p-4 text-xs font-mono break-all select-all text-[#a8c7fa] tracking-wider leading-relaxed shadow-inner">
            {plaintext}
          </div>
          
          <div className="flex justify-end mt-1">
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Token Identifier"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            placeholder="e.g. desktop-app, cron-import"
          />
          
          {error && <p className="text-xs text-red-400 font-sans ml-3">{error}</p>}
          
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createMut.isPending}>
              Create Key
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
