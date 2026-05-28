import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { PatToken } from '../../api/types'
import {
  Button,
  Card,
  Avatar,
  Chip,
  Spinner,
  Input,
  Modal,
  Accordion,
} from '@heroui/react'
import { KeyIcon } from '../../icons'

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
        <h1 className="text-2xl font-medium">API Keys</h1>
        <Button className="bg-primary text-primary-foreground font-medium" onPress={() => setCreating(true)}>
          Create Key
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : tokens.length === 0 ? (
        <Card className="py-12">
          <Card.Content className="flex flex-col items-center gap-4">
            <KeyIcon className="text-default-300 w-12 h-12" />
            <p className="text-default-500 text-sm">No API keys yet.</p>
          </Card.Content>
        </Card>
      ) : tokens.length <= INITIAL_SHOW ? (
        <Card>
          <Card.Content className="p-0">
            <div className="flex flex-col divide-y divide-default-100">
              {tokens.map((t) => (
                <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
              ))}
            </div>
          </Card.Content>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <Card.Content className="p-0">
              <div className="flex flex-col divide-y divide-default-100">
                {tokens.slice(0, INITIAL_SHOW).map((t) => (
                  <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
                ))}
              </div>
            </Card.Content>
          </Card>
          <Accordion className="bg-content1 rounded-xl shadow-sm border border-default-200">
            <Accordion.Item>
              <Accordion.Heading>
                <Accordion.Trigger className="flex items-center gap-2 p-4">
                  <span className="font-medium">Show more</span>
                  <Chip size="sm" className="bg-default-100">{tokens.length - INITIAL_SHOW}</Chip>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <div className="flex flex-col divide-y divide-default-100 border-t border-default-100">
                  {tokens.slice(INITIAL_SHOW).map((t) => (
                    <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
                  ))}
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      )}

      {creating && <CreateTokenModal isOpen={creating} onClose={() => setCreating(false)} />}

      <Modal isOpen={!!revoking} onOpenChange={(open) => !open && setRevoking(null)}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Revoke API Key</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-default-500 text-sm">
              Revoke <span className="font-medium text-foreground">{revoking?.name}</span>? This cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-default-100" onPress={() => setRevoking(null)}>Cancel</Button>
            <Button className="bg-danger text-danger-foreground" isDisabled={revokeMut.isPending} onPress={() => revoking && revokeMut.mutate(revoking.id)}>
              {revokeMut.isPending ? "Revoking..." : "Revoke"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    </div>
  )
}

function TokenRow({ token, onRevoke }: { token: PatToken; onRevoke: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-default-50 transition-colors">
      <Avatar className="shrink-0 bg-primary/10 text-primary" />
      
      <div className="flex-1">
        <p className="font-medium text-base">{token.name}</p>
        <p className="text-sm text-default-500 mt-1">
          Created {new Date(token.createdAt).toLocaleDateString()}
          <span className="mx-2">·</span>
          {token.lastUsedAt ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}` : 'Never used'}
        </p>
      </div>

      <Button className="border border-default-200 bg-transparent text-default-700" size="sm" onPress={onRevoke}>
        Revoke
      </Button>
    </div>
  )
}

function CreateTokenModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && !plaintext && onClose()}>
      <Modal.Dialog>
        {plaintext ? (
          <>
            <Modal.Header>
              <Modal.Heading>API Key Created</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <div className="p-3 bg-warning-100 text-warning-800 rounded-lg">
                <p className="font-bold text-xs uppercase tracking-wider mb-1">Copy now</p>
                <p className="text-sm">This token won't be shown again.</p>
              </div>
              <div className="p-3 bg-default-100 border border-default-200 rounded-lg font-mono text-sm break-all select-all text-primary">
                {plaintext}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                className="bg-primary text-primary-foreground"
                onPress={() => {
                  queryClient.invalidateQueries({ queryKey: ['pat'] })
                  onClose()
                }}
              >
                Done
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>Create API Key</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <label className="text-sm font-medium">Token Name</label>
              <Input
                autoFocus
                className="w-full bg-default-100 px-3 py-2 rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. desktop-app, cron-import"
              />
              {error && <span className="text-sm text-danger">{error}</span>}
            </Modal.Body>
            <Modal.Footer>
              <Button className="bg-default-100" onPress={onClose}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" isDisabled={createMut.isPending}>
                {createMut.isPending ? "Creating..." : "Create"}
              </Button>
            </Modal.Footer>
          </form>
        )}
      </Modal.Dialog>
    </Modal>
  )
}
