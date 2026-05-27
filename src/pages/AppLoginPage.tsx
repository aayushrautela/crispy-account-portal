import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useSession'
import { AuthLayout } from '../layouts/AuthLayout'

export function AppLoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const clientId = searchParams.get('client_id')
  const returnUri = searchParams.get('return_uri')
  const codeChallenge = searchParams.get('code_challenge')
  const codeChallengeMethod = searchParams.get('code_challenge_method')
  const state = searchParams.get('state')
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  const missingParams =
    !clientId || !returnUri || !codeChallenge || codeChallengeMethod !== 'S256' || !state

  useEffect(() => {
    if (!auth.session || error || missingParams) return

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
            body: JSON.stringify({ clientId, returnUri, codeChallenge, codeChallengeMethod: 'S256', state }),
          },
        )
        const envelope = await res.json()
        if (cancelled) return

        const redirectUri: string | undefined = envelope?.data?.redirectUri
        if (!redirectUri) {
          setError('Server did not return a redirect URI.')
          return
        }

        try {
          const parsed = new URL(redirectUri)
          const returnedCode = parsed.searchParams.get('code')
          const returnedState = parsed.searchParams.get('state')
          if (!returnedCode) {
            setError('Redirect URI missing authorization code.')
            return
          }
          if (returnedState !== state) {
            setError('State mismatch in redirect.')
            return
          }
        } catch {
          setError('Invalid redirect URI from server.')
          return
        }

        window.location.href = redirectUri
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [auth.session, clientId, returnUri, codeChallenge, state, missingParams, error])

  if (missingParams) {
    return (
      <AuthLayout title="Invalid request">
        <p className="text-sm text-red-400">
          Missing required parameters. Apps must provide client_id, return_uri, code_challenge, code_challenge_method=S256, and state.
        </p>
      </AuthLayout>
    )
  }

  if (!auth.session) {
    const loginRedirect = encodeURIComponent(
      `/app-login?client_id=${encodeURIComponent(clientId!)}&return_uri=${encodeURIComponent(returnUri!)}&code_challenge=${encodeURIComponent(codeChallenge!)}&code_challenge_method=S256&state=${encodeURIComponent(state!)}`,
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
