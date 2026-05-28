import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useSession'
import { cn } from '../../lib/utils'

export function AccountSettingsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-semibold tracking-wide font-display text-stone-100">Account</h1>

      <Card noPadding>
        <div className="py-1">
          <ApiKeyRow
            provider="openrouter"
            title="OpenRouter API Key"
            subtitle="Routes LLM requests via secure endpoints"
            iconBg="#1a73e8"
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h14v2H5zm0-4h14v2H5zm0-4h14v2H5z" />
              </svg>
            }
          />
          <ApiKeyRow
            provider="mdblist"
            title="MDBList API Key"
            subtitle="Movie metadata, ratings, and filters"
            iconBg="#e37400"
            icon={
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
              </svg>
            }
          />
        </div>
      </Card>

      <Card noPadding className="border border-red-500/10">
        <div className="py-1">
          <DeleteAccountRow signOut={signOut} navigate={navigate} />
        </div>
      </Card>
    </div>
  )
}

function ApiKeyRow({
  provider,
  title,
  iconBg,
  icon,
}: {
  provider: string
  title: string
  subtitle: string
  iconBg: string
  icon: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')

  const { data: result, isLoading } = useQuery({
    queryKey: ['secret', provider],
    queryFn: () => api.secrets[provider as 'ai' | 'mdblist'].get(),
  })

  const secret = result?.secret

  const putMut = useMutation({
    mutationFn: async (v: string) => api.secrets[provider as 'ai' | 'mdblist'].put(v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secret', provider] })
      setValue('')
    },
  })

  const delMut = useMutation({
    mutationFn: async () => api.secrets[provider as 'ai' | 'mdblist'].delete(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secret', provider] }),
  })

  const statusText = isLoading ? 'Checking...' : secret?.present ? `Present (${secret.fingerprint})` : 'Not configured'

  return (
    <>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-m3-hover/50 transition-colors text-left group"
      >
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-stone-100 font-sans">{title}</h3>
          <p className="text-xs text-stone-400 font-sans mt-0.5">{statusText}</p>
        </div>
        <svg
          className={cn(
            'w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 flex flex-col gap-3">
            {secret?.present && (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" loading={delMut.isPending} onClick={() => delMut.mutate()}>
                  Remove
                </Button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder={provider === 'ai' ? 'sk-or-...' : 'Enter MDBList key'}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                className="flex-1 font-mono text-xs"
              />
              <Button loading={putMut.isPending} disabled={!value.trim()} onClick={() => value.trim() && putMut.mutate(value.trim())} className="sm:w-auto">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function DeleteAccountRow({
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

  return (
    <>
      <button
        onClick={() => setConfirming(!confirming)}
        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-m3-hover/50 transition-colors text-left group"
      >
        <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-red-500/10">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-400 font-sans">Delete account</h3>
          <p className="text-xs text-stone-400 font-sans mt-0.5">Permanently delete your account and all data</p>
        </div>
        <svg
          className={cn(
            'w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200',
            confirming && 'rotate-180'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          confirming ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 flex flex-col gap-3">
            <p className="text-xs text-stone-300 font-sans">
              This is permanent. Type <strong className="text-red-400">DELETE</strong> to confirm.
            </p>
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
        </div>
      </div>
    </>
  )
}
