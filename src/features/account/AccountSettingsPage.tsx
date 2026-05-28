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
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Account Settings</h1>
        <p className="text-sm text-stone-400 font-sans tracking-wide">
          Manage your credentials, custom AI gateway keys, database keys, and account standing.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <OpenRouterKeySection />
        <MdbListKeySection />
        <DeleteAccountSection signOut={signOut} navigate={navigate} />
      </div>
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secret', 'ai'] })
      setValue('')
    },
  })

  const delMut = useMutation({
    mutationFn: async () => api.secrets.ai.delete(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secret', 'ai'] }),
  })

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-stone-100 font-display tracking-wide">OpenRouter API Key</h2>
        <p className="text-xs text-stone-400 font-sans mt-1">
          Used to route OpenAI and general LLM requests via secure endpoints.
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-m3-bg/40 px-4 py-2.5 rounded-full border border-m3-border/10">
            <span className="text-xs text-stone-400">Status</span>
            <span className="text-xs font-mono font-medium text-[#a8c7fa]">
              {secret?.present ? `Present (fingerprint: ${secret.fingerprint})` : 'Not configured'}
            </span>
          </div>

          {secret?.present ? (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                loading={delMut.isPending}
                onClick={() => delMut.mutate()}
              >
                Remove Key
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Input
              placeholder="sk-or-... (Paste custom API key)"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="flex-1 font-mono text-xs"
            />
            <Button
              loading={putMut.isPending}
              disabled={!value.trim()}
              onClick={() => value.trim() && putMut.mutate(value.trim())}
              className="sm:w-auto"
            >
              Save Key
            </Button>
          </div>
        </div>
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secret', 'mdblist'] })
      setValue('')
    },
  })

  const delMut = useMutation({
    mutationFn: async () => api.secrets.mdblist.delete(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secret', 'mdblist'] }),
  })

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-stone-100 font-display tracking-wide">MDBList API Key</h2>
        <p className="text-xs text-stone-400 font-sans mt-1">
          Used to gather metadata details, ratings, and filters for library imports.
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-m3-bg/40 px-4 py-2.5 rounded-full border border-m3-border/10">
            <span className="text-xs text-stone-400">Status</span>
            <span className="text-xs font-mono font-medium text-[#a8c7fa]">
              {secret?.present ? `Present (fingerprint: ${secret.fingerprint})` : 'Not configured'}
            </span>
          </div>

          {secret?.present ? (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                loading={delMut.isPending}
                onClick={() => delMut.mutate()}
              >
                Remove Key
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Input
              placeholder="Enter custom MDBList key"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="flex-1 font-mono text-xs"
            />
            <Button
              loading={putMut.isPending}
              disabled={!value.trim()}
              onClick={() => value.trim() && putMut.mutate(value.trim())}
              className="sm:w-auto"
            >
              Save Key
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function DeleteAccountSection({
  signOut,
  navigate,
}: {
  signOut: () => Promise<void>
  navigate: (path: string) => void
}) {
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
      <Card className="border border-red-500/10 bg-red-500/[0.02] flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-red-400 font-display tracking-wide">Danger Zone</h2>
          <p className="text-xs text-stone-400 font-sans mt-1">
            Permanently delete your Crispy account, configurations, key definitions, and settings.
          </p>
        </div>
        <div className="flex justify-start">
          <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
            Delete Account
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-red-500/30 bg-red-500/[0.05] flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-red-400 font-display tracking-wide">Confirm Account Deletion</h2>
        <p className="text-xs text-stone-300 font-sans mt-1">
          This operation is permanent. Type <strong className="text-red-400">DELETE</strong> to confirm deletion.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={confirmText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="font-mono text-xs uppercase"
        />
        <div className="flex gap-3 mt-1">
          <Button
            variant="danger"
            disabled={confirmText !== 'DELETE'}
            loading={delMut.isPending}
            onClick={() => delMut.mutate()}
          >
            Delete Permanently
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirming(false)
              setConfirmText('')
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}
