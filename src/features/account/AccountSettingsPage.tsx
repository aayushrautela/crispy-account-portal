import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Spinner } from '../../components/Spinner'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useSession'
import { cn } from '../../lib/utils'

export function AccountSettingsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Account</h1>
        <p className="text-sm text-stone-400 font-sans tracking-wide">
          Manage your API keys, credentials, and account settings.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ApiKeysAccordion />
        <DeleteAccountSection signOut={signOut} navigate={navigate} />
      </div>
    </div>
  )
}

function ApiKeysAccordion() {
  const [openSection, setOpenSection] = useState<string | null>('openrouter')

  const sections = [
    { id: 'openrouter', title: 'OpenRouter API Key', description: 'Routes LLM requests via secure endpoints.' },
    { id: 'mdblist', title: 'MDBList API Key', description: 'Movie metadata, ratings, and filters.' },
  ]

  return (
    <Card noPadding>
      {sections.map((section, i) => {
        const isOpen = openSection === section.id
        return (
          <div key={section.id} className={cn(i > 0 && 'border-t border-m3-border/10')}>
            <button
              onClick={() => setOpenSection(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-m3-hover/30 transition-colors cursor-pointer"
            >
              <div className="text-left">
                <h3 className="text-sm font-semibold text-stone-100 font-sans tracking-wide">{section.title}</h3>
                <p className="text-xs text-stone-400 font-sans mt-0.5">{section.description}</p>
              </div>
              <svg
                className={cn('w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ml-4', isOpen && 'rotate-180')}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
            <div
              className={cn(
                'grid transition-all duration-200 ease-in-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5">
                  {section.id === 'openrouter' ? <OpenRouterKeySection /> : <MdbListKeySection />}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </Card>
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

  if (isLoading) return <Spinner />

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between bg-m3-bg/40 px-4 py-2.5 rounded-full border border-m3-border/10">
        <span className="text-xs text-stone-400">Status</span>
        <span className="text-xs font-mono font-medium text-[#a8c7fa]">
          {secret?.present ? `Present (${secret.fingerprint})` : 'Not configured'}
        </span>
      </div>

      {secret?.present && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" loading={delMut.isPending} onClick={() => delMut.mutate()}>
            Remove
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="sk-or-..."
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
        <Button loading={putMut.isPending} disabled={!value.trim()} onClick={() => value.trim() && putMut.mutate(value.trim())} className="sm:w-auto">
          Save
        </Button>
      </div>
    </div>
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

  if (isLoading) return <Spinner />

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between bg-m3-bg/40 px-4 py-2.5 rounded-full border border-m3-border/10">
        <span className="text-xs text-stone-400">Status</span>
        <span className="text-xs font-mono font-medium text-[#a8c7fa]">
          {secret?.present ? `Present (${secret.fingerprint})` : 'Not configured'}
        </span>
      </div>

      {secret?.present && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" loading={delMut.isPending} onClick={() => delMut.mutate()}>
            Remove
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Enter MDBList key"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
        <Button loading={putMut.isPending} disabled={!value.trim()} onClick={() => value.trim() && putMut.mutate(value.trim())} className="sm:w-auto">
          Save
        </Button>
      </div>
    </div>
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
            Permanently delete your account and all data.
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
        <h2 className="text-base font-semibold text-red-400 font-display tracking-wide">Confirm Deletion</h2>
        <p className="text-xs text-stone-300 font-sans mt-1">
          This is permanent. Type <strong className="text-red-400">DELETE</strong> to confirm.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={confirmText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="font-mono text-xs uppercase"
        />
        <div className="flex gap-3">
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
