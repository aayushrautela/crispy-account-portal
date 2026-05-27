import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Spinner } from '../../components/Spinner'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useSession'

export function AccountSettingsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Account Settings</h1>
      <OpenRouterKeySection />
      <MdbListKeySection />
      <DeleteAccountSection signOut={signOut} navigate={navigate} />
    </div>
  )
}

function OpenRouterKeySection() {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')

  const { data: result, isLoading } = useQuery({
    queryKey: ['secret', 'ai'],
    queryFn: () => api.secrets.ai.get(),
  })

  const secret = result?.secret

  const putMut = useMutation({
    mutationFn: async (v: string) => api.secrets.ai.put(v),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['secret', 'ai'] }); setValue('') },
  })

  const delMut = useMutation({
    mutationFn: async () => api.secrets.ai.delete(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secret', 'ai'] }),
  })

  return (
    <Card>
      <h2 className="text-sm font-medium text-stone-400 mb-3">OpenRouter API Key</h2>
      {isLoading ? <Spinner /> : (
        <>
          <p className="text-xs text-stone-500 mb-3">
            {secret?.present ? `Present (fingerprint: ${secret.fingerprint})` : 'Not set'}
          </p>
          {secret?.present ? (
            <div className="flex gap-2">
              <Button variant="secondary" loading={delMut.isPending} onClick={() => delMut.mutate()}>Remove key</Button>
            </div>
          ) : null}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="sk-or-..."
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="flex-1"
            />
            <Button loading={putMut.isPending} onClick={() => value.trim() && putMut.mutate(value.trim())}>
              Save
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}

function MdbListKeySection() {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')

  const { data: result, isLoading } = useQuery({
    queryKey: ['secret', 'mdblist'],
    queryFn: () => api.secrets.mdblist.get(),
  })

  const secret = result?.secret

  const putMut = useMutation({
    mutationFn: async (v: string) => api.secrets.mdblist.put(v),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['secret', 'mdblist'] }); setValue('') },
  })

  const delMut = useMutation({
    mutationFn: async () => api.secrets.mdblist.delete(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secret', 'mdblist'] }),
  })

  return (
    <Card>
      <h2 className="text-sm font-medium text-stone-400 mb-3">MDBList API Key</h2>
      {isLoading ? <Spinner /> : (
        <>
          <p className="text-xs text-stone-500 mb-3">
            {secret?.present ? `Present (fingerprint: ${secret.fingerprint})` : 'Not set'}
          </p>
          {secret?.present ? (
            <div className="flex gap-2">
              <Button variant="secondary" loading={delMut.isPending} onClick={() => delMut.mutate()}>Remove key</Button>
            </div>
          ) : null}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="mdblist key"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="flex-1"
            />
            <Button loading={putMut.isPending} onClick={() => value.trim() && putMut.mutate(value.trim())}>
              Save
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}

function DeleteAccountSection({ signOut, navigate }: { signOut: () => Promise<void>; navigate: (path: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const queryClient = useQueryClient()

  const delMut = useMutation({
    mutationFn: async () => api.account.delete(),
    onSuccess: async () => {
      await signOut()
      queryClient.clear()
      navigate('/signed-out')
    },
  })

  if (!confirming) {
    return (
      <Card>
        <h2 className="text-sm font-medium text-red-400 mb-3">Danger zone</h2>
        <Button variant="danger" onClick={() => setConfirming(true)}>Delete account</Button>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-sm font-medium text-red-400 mb-3">Confirm account deletion</h2>
      <p className="text-sm text-stone-500 mb-3">Type DELETE to confirm permanent account deletion.</p>
      <Input value={confirmText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)} placeholder="DELETE" />
      <div className="flex gap-2 mt-3">
        <Button variant="danger" disabled={confirmText !== 'DELETE'} loading={delMut.isPending} onClick={() => delMut.mutate()}>
          Delete permanently
        </Button>
        <Button variant="secondary" onClick={() => { setConfirming(false); setConfirmText('') }}>Cancel</Button>
      </div>
    </Card>
  )
}
