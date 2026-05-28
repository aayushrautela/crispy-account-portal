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
  const base = 'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 rounded-full disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]'
  
  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
  }
  
  const variants: Record<string, string> = {
    primary: 'bg-[#a8c7fa] text-[#062e6f] hover:bg-[#c2e7ff] hover:shadow-md shadow-sm',
    secondary: 'border border-[#8e918f] text-[#c4c7c5] hover:bg-[#202124] hover:text-stone-100',
    danger: 'bg-[#f2b8b5] text-[#601410] hover:bg-[#f9dedc] hover:shadow-md',
    ghost: 'text-[#a8c7fa] hover:bg-[#a8c7fa]/10 hover:text-[#c2e7ff]',
  }

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {children}
    </button>
  )
}
