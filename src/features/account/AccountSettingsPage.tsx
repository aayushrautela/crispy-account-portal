import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useSession'
import { 
  Card, 
  Avatar, 
  Button,
  Input
} from '@heroui/react'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import MovieIcon from '@mui/icons-material/Movie'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export function AccountSettingsPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-medium">Account</h1>

      <Card>
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            <ApiKeyRow
              provider="openrouter"
              title="OpenRouter API Key"
              subtitle="Routes LLM requests via secure endpoints"
              iconBg="#1a73e8"
              icon={<VpnKeyIcon />}
            />
            <ApiKeyRow
              provider="mdblist"
              title="MDBList API Key"
              subtitle="Movie metadata, ratings, and filters"
              iconBg="#e37400"
              icon={<MovieIcon />}
            />
          </div>
        </Card.Content>
      </Card>

      <Card className="border-danger/30">
        <Card.Content className="p-0">
          <div className="flex flex-col divide-y divide-default-100">
            <DeleteAccountRow signOut={signOut} navigate={navigate} />
          </div>
        </Card.Content>
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
    <div className="flex flex-col">
      <div 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-4 px-6 py-4 hover:bg-default-100 cursor-pointer transition-colors"
      >
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-default-500 mt-0.5">{statusText}</p>
        </div>
        <ExpandMoreIcon className={`text-default-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
          {secret?.present && (
            <div className="flex justify-end">
              <Button 
                className="bg-danger/10 text-danger" 
                size="sm" 
                isDisabled={delMut.isPending} 
                onPress={() => delMut.mutate()}
              >
                Remove
              </Button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              className="w-full bg-default-100 px-3 py-2 rounded-lg font-mono text-sm"
              placeholder={provider === 'openrouter' ? 'sk-or-...' : 'Enter MDBList key'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button 
              className="bg-primary text-primary-foreground font-medium shrink-0" 
              isDisabled={!value.trim() || putMut.isPending} 
              onPress={() => value.trim() && putMut.mutate(value.trim())}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
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
    <div className="flex flex-col">
      <div 
        onClick={() => setConfirming(!confirming)} 
        className="flex items-center gap-4 px-6 py-4 hover:bg-danger-50 cursor-pointer transition-colors"
      >
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-danger text-white">
          <DeleteIcon />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-danger">Delete account</h3>
          <p className="text-sm text-default-500 mt-0.5">Permanently delete your account and all data</p>
        </div>
        <ExpandMoreIcon className={`text-default-400 transition-transform ${confirming ? 'rotate-180' : ''}`} />
      </div>

      {confirming && (
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4 border-t border-danger/10 mt-2">
          <p className="text-sm text-default-500">
            This is permanent. Type <span className="text-danger font-bold">DELETE</span> to confirm.
          </p>
          <Input
            className="w-full bg-default-100 px-3 py-2 rounded-lg font-mono text-sm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
          <div className="flex gap-4">
            <Button
              className="bg-danger text-danger-foreground font-medium"
              isDisabled={confirmText !== 'DELETE' || delMut.isPending}
              onPress={() => delMut.mutate()}
            >
              Delete Permanently
            </Button>
            <Button
              className="bg-transparent text-default-700 border border-default-200"
              onPress={() => {
                setConfirming(false)
                setConfirmText('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
