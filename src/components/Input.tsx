import { cn } from '../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-stone-400 font-sans ml-4">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-full bg-m3-surface px-5 py-2.5 text-sm text-stone-100 placeholder-stone-500 outline-none transition-all duration-200 focus:ring-1 focus:ring-[#a8c7fa] focus:border-[#a8c7fa]',
          error ? 'border border-red-400 focus:ring-red-400 focus:border-red-400' : 'border border-[#8e918f] focus:border-[#a8c7fa]',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400 ml-4 font-sans">{error}</span>}
    </div>
  )
}
