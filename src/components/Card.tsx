import { cn } from '../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  noPadding?: boolean
}

export function Card({ className, children, interactive, noPadding, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#2d2e30] overflow-hidden transition-all duration-150',
        interactive && 'hover:bg-m3-hover cursor-pointer active:scale-[0.995]',
        noPadding ? 'p-0' : 'px-5 py-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
