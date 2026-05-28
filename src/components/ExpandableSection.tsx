import { useState } from 'react'
import { cn } from '../lib/utils'

interface ExpandableSectionProps {
  title: string
  count?: number
  defaultExpanded?: boolean
  children: React.ReactNode
}

export function ExpandableSection({ title, count, defaultExpanded = false, children }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 ml-1 group cursor-pointer"
      >
        <h3 className="text-xs font-semibold text-stone-400 font-sans uppercase tracking-wider">
          {title}
        </h3>
        {count !== undefined && (
          <span className="text-[10px] font-semibold text-stone-500 bg-m3-surface px-2 py-0.5 rounded-full border border-m3-border/20">
            {count}
          </span>
        )}
        <svg
          className={cn(
            'w-3.5 h-3.5 text-stone-500 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
