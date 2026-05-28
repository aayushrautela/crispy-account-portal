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
      <div className="text-center max-w-md w-full bg-m3-surface rounded-3xl p-8 border border-m3-border/10 shadow-2xl">
        <div className="h-16 w-16 bg-red-500/[0.08] text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-400 font-display tracking-wide mb-2">Sign In Failed</h1>
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
      <div className="text-center max-w-md w-full bg-m3-surface rounded-3xl p-8 border border-m3-border/10 shadow-2xl flex flex-col items-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#a8c7fa] border-t-transparent rounded-full mb-5" />
        <h2 className="text-xl font-bold text-stone-100 font-display tracking-wide mb-1">Authenticating</h2>
        <p className="text-sm text-stone-400 leading-relaxed">
          Establishing a secure handoff connection...
        </p>
      </div>
    </div>
  )
}
