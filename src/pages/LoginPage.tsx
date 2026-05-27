import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import { AuthLayout, AuthLink } from '../layouts/AuthLayout'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

const SAFE_REDIRECTS = new Set(['/', '/account', '/profiles', '/provider-imports', '/addons', '/api-keys'])

function safeRedirect(value: string | null): string {
  if (!value) return '/'
  if (value.startsWith('//') || value.startsWith('http:') || value.startsWith('https:') || value.includes('\\')) return '/'
  if (SAFE_REDIRECTS.has(value)) return value
  if (value.startsWith('/app-login?')) return value
  return '/'
}

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      navigate(redirect)
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" loading={loading}>Sign in</Button>
        <div className="flex justify-between mt-2">
          <AuthLink to="/signup">Create account</AuthLink>
          <AuthLink to="/reset-password">Forgot password?</AuthLink>
        </div>
      </form>
    </AuthLayout>
  )
}
