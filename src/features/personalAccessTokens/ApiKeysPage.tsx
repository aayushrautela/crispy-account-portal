import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import type { PatToken } from '../../api/types'
import {
  Button,
  Card,
  CardBody,
  Avatar,
  Chip,
  Spinner,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem
} from '@heroui/react'
import SecurityIcon from '@mui/icons-material/Security'
import KeyIcon from '@mui/icons-material/Key'

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
        <Button color="primary" onPress={() => setCreating(true)}>
          Create Key
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : tokens.length === 0 ? (
        <Card className="py-12">
          <CardBody className="flex flex-col items-center gap-4">
            <KeyIcon className="text-default-300 w-12 h-12" />
            <p className="text-default-500 text-sm">No API keys yet.</p>
          </CardBody>
        </Card>
      ) : tokens.length <= INITIAL_SHOW ? (
        <Card>
          <CardBody className="p-0">
            <div className="flex flex-col divide-y divide-default-100">
              {tokens.map((t) => (
                <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
              ))}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardBody className="p-0">
              <div className="flex flex-col divide-y divide-default-100">
                {tokens.slice(0, INITIAL_SHOW).map((t) => (
                  <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
                ))}
              </div>
            </CardBody>
          </Card>
          <Accordion variant="bordered" className="bg-content1">
            <AccordionItem 
              key="more" 
              aria-label="Show more" 
              title={
                <div className="flex items-center gap-2">
                  <span className="font-medium">Show more</span>
                  <Chip size="sm" variant="flat">{tokens.length - INITIAL_SHOW}</Chip>
                </div>
              }
            >
              <div className="flex flex-col divide-y divide-default-100 border-t border-default-100">
                {tokens.slice(INITIAL_SHOW).map((t) => (
                  <TokenRow key={t.id} token={t} onRevoke={() => setRevoking(t)} />
                ))}
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {creating && <CreateTokenModal isOpen={creating} onClose={() => setCreating(false)} />}

      <Modal isOpen={!!revoking} onOpenChange={(open) => !open && setRevoking(null)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Revoke API Key</ModalHeader>
              <ModalBody>
                <p className="text-default-500 text-sm">
                  Revoke <span className="font-medium text-foreground">{revoking?.name}</span>? This cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button color="danger" isLoading={revokeMut.isPending} onPress={() => revoking && revokeMut.mutate(revoking.id)}>
                  Revoke
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

function TokenRow({ token, onRevoke }: { token: PatToken; onRevoke: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-default-50 transition-colors">
      <Avatar icon={<SecurityIcon fontSize="small" />} color="primary" classNames={{ base: "shrink-0" }} />
      
      <div className="flex-1">
        <p className="font-medium text-base">{token.name}</p>
        <p className="text-sm text-default-500 mt-1">
          Created {new Date(token.createdAt).toLocaleDateString()}
          <span className="mx-2">·</span>
          {token.lastUsedAt ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}` : 'Never used'}
        </p>
      </div>

      <Button variant="bordered" size="sm" onPress={onRevoke}>
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
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && !plaintext && onClose()} isDismissable={!plaintext} hideCloseButton={!!plaintext}>
      <ModalContent>
        {(onCloseFn) => (
          <>
            {plaintext ? (
              <>
                <ModalHeader>API Key Created</ModalHeader>
                <ModalBody className="flex flex-col gap-4">
                  <div className="p-3 bg-warning-100 text-warning-800 rounded-lg">
                    <p className="font-bold text-xs uppercase tracking-wider mb-1">Copy now</p>
                    <p className="text-sm">This token won't be shown again.</p>
                  </div>
                  <div className="p-3 bg-default-100 border border-default-200 rounded-lg font-mono text-sm break-all select-all text-primary">
                    {plaintext}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary"
                    onPress={() => {
                      queryClient.invalidateQueries({ queryKey: ['pat'] })
                      onCloseFn()
                    }}
                  >
                    Done
                  </Button>
                </ModalFooter>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <ModalHeader>Create API Key</ModalHeader>
                <ModalBody className="flex flex-col gap-4">
                  <Input
                    autoFocus
                    label="Token Name"
                    value={name}
                    onValueChange={setName}
                    isRequired
                    placeholder="e.g. desktop-app, cron-import"
                    errorMessage={error}
                    isInvalid={!!error}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onCloseFn}>Cancel</Button>
                  <Button type="submit" color="primary" isLoading={createMut.isPending}>
                    Create
                  </Button>
                </ModalFooter>
              </form>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
