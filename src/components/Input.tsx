import { cn } from '../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-stone-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-lg border bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 outline-none transition-colors focus:border-stone-500',
          error ? 'border-red-500' : 'border-stone-700',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
