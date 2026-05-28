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
    <div className="min-h-screen flex items-center justify-center bg-m3-bg text-[#e3e3e3] px-4 font-sans">
      <div className="text-center max-w-md w-full bg-m3-surface rounded-3xl p-8 shadow-2xl">
        <div className="h-16 w-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-400 font-display mb-2">Sign In Failed</h1>
        <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto">
          {error}
        </p>
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
    return <ExchangeFailure error="Missing handoff authentication code." />
  }

  if (error) {
    return <ExchangeFailure error={error} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-m3-bg text-[#e3e3e3] px-4 font-sans">
      <div className="text-center max-w-md w-full bg-m3-surface rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        <div className="animate-spin h-10 w-10 border-4 border-m3-blue border-t-transparent rounded-full mb-5" />
        <h2 className="text-xl font-bold text-stone-100 font-display mb-1">Authenticating</h2>
        <p className="text-sm text-stone-400 leading-relaxed">
          Establishing a secure handoff connection...
        </p>
      </div>
    </div>
  )
}
