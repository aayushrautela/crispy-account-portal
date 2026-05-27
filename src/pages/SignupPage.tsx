import { useState } from 'react'
import { useAuth } from '../auth/useSession'
import { AuthLayout, AuthLink } from '../layouts/AuthLayout'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export function SignupPage() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent you a confirmation link.">
        <p className="text-sm text-stone-400 text-center">
          You can close this window after confirming.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create account" subtitle="Sign up for a new account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" loading={loading}>Create account</Button>
        <div className="text-center mt-2">
          <AuthLink to="/login">Already have an account? Sign in</AuthLink>
        </div>
      </form>
    </AuthLayout>
  )
}
