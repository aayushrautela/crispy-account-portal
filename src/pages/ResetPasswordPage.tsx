import { useState } from 'react'
import { useAuth } from '../auth/useSession'
import { AuthLayout, AuthLink } from '../layouts/AuthLayout'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Check your email" subtitle="Password reset link sent.">
        <p className="text-sm text-stone-400 text-center">Check your email and follow the link to reset your password.</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" loading={loading}>Send reset link</Button>
        <div className="text-center mt-2">
          <AuthLink to="/login">Back to sign in</AuthLink>
        </div>
      </form>
    </AuthLayout>
  )
}
