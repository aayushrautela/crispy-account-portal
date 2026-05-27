import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { BASE_URL, setCsrfToken } from '../api/client'

const SAFE_REDIRECTS = new Set(['/', '/account', '/profiles', '/provider-imports', '/addons', '/api-keys'])

function safeRedirect(value: string | null): string {
  if (!value || value.startsWith('//') || value.startsWith('http:') || value.startsWith('https:') || value.includes('\\')) return '/account'
  if (SAFE_REDIRECTS.has(value)) return value
  return '/account'
}

function ExchangeFailure({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="text-center max-w-sm">
        <h1 className="text-lg font-medium text-red-400 mb-2">Sign in failed</h1>
        <p className="text-sm text-stone-500">{error}</p>
      </div>
    </div>
  )
}

export function AppHandoffPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code')
  const redirect = safeRedirect(searchParams.get('redirect'))

  const [error, setError] = useState<string | null>(null)
  const [exchanged, setExchanged] = useState(false)

  useEffect(() => {
    if (!code || exchanged) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/v1/auth/portal-handoff/exchange`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code }),
          },
        )
        if (!res.ok) {
          const body = await res.text()
          throw new Error(`Exchange failed (${res.status}): ${body}`)
        }
        const envelope = await res.json()
        const data = envelope?.data ?? envelope
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        }

        if (!cancelled) {
          setExchanged(true)
          navigate(redirect, { replace: true })
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })()

    return () => { cancelled = true }
  }, [code, navigate, redirect, exchanged])

  if (!code) {
    return <ExchangeFailure error="Missing handoff code." />
  }

  if (error) {
    return <ExchangeFailure error={error} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400 mx-auto mb-4" />
        <p className="text-sm text-stone-400">Signing in...</p>
      </div>
    </div>
  )
}
