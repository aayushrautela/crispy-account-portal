import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import { AuthLayout } from '../layouts/AuthLayout'

export function AppLoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const returnUri = searchParams.get('return_uri') || 'crispy://auth/callback'
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.session || error) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_CRISPY_API_BASE_URL}/v1/auth/app-login/handoff-codes`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${auth.session!.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ returnUri }),
          },
        )
        const envelope = await res.json()
        if (cancelled) return

        const redirectUri = envelope?.data?.redirectUri
        if (redirectUri) {
          window.location.href = redirectUri
        } else {
          setError('Server did not return a redirect URI.')
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [auth.session, returnUri, error])

  if (!auth.session) {
    const loginRedirect = encodeURIComponent(
      `/app-login?return_uri=${encodeURIComponent(returnUri)}`,
    )
    navigate(`/login?redirect=${loginRedirect}`, { replace: true })
    return null
  }

  if (error) {
    return (
      <AuthLayout title="Sign in failed">
        <p className="text-sm text-red-400">{error}</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Redirecting to app">
      <p className="text-sm text-stone-400">You will be redirected back to the app shortly.</p>
    </AuthLayout>
  )
}
