import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-stone-100">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-stone-500">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm text-stone-400 hover:text-stone-200 transition-colors">
      {children}
    </Link>
  )
}
