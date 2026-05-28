import { cn } from '../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 rounded-full disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]'

  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2 text-sm',
  }

  const variants: Record<string, string> = {
    primary: 'bg-[#a8c7fa] text-[#062e6f] hover:bg-[#c2e7ff] shadow-sm',
    secondary: 'border border-[#5f6368] text-stone-300 hover:bg-[#2d2e30] hover:text-stone-100',
    danger: 'bg-[#f28b82] text-[#601410] hover:bg-[#f2b8b5]',
    ghost: 'text-[#a8c7fa] hover:bg-[#a8c7fa]/10',
  }

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
      )}
      {children}
    </button>
  )
}
