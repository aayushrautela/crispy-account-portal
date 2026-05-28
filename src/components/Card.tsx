import { cn } from '../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  noPadding?: boolean
}

export function Card({ className, children, interactive, noPadding, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-m3-surface border border-m3-border/20 shadow-sm overflow-hidden transition-all duration-200',
        interactive && 'hover:bg-m3-hover cursor-pointer active:scale-[0.995]',
        noPadding ? 'p-0' : 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  iconBgColor?: 'green' | 'blue' | 'purple' | 'pink' | 'orange'
  title: string
  description?: string
  rightElement?: React.ReactNode
  onClick?: () => void
}

export function CardRow({
  className,
  icon,
  iconBgColor = 'blue',
  title,
  description,
  rightElement,
  onClick,
  ...props
}: CardRowProps) {
  const bgClasses = {
    green: 'bg-m3-green/10 text-m3-green',
    blue: 'bg-m3-blue/10 text-m3-blue',
    purple: 'bg-m3-purple/10 text-m3-purple',
    pink: 'bg-m3-pink/10 text-m3-pink',
    orange: 'bg-m3-orange/10 text-m3-orange',
  }

  const isClickable = !!onClick

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 py-4 transition-colors border-b border-m3-border/10 last:border-none',
        isClickable && 'hover:bg-m3-hover cursor-pointer active:bg-m3-hover/80',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {icon && (
          <div className={cn('h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg', bgClasses[iconBgColor])}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-stone-100 font-sans tracking-wide leading-tight truncate">{title}</h4>
          {description && (
            <p className="text-xs text-stone-400 font-sans mt-0.5 tracking-normal leading-normal truncate">{description}</p>
          )}
        </div>
      </div>
      {rightElement && <div className="shrink-0 flex items-center">{rightElement}</div>}
    </div>
  )
}
