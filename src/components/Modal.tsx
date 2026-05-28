import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-m3-surface p-8 shadow-2xl border border-m3-border/20 transition-all duration-300 transform scale-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-100 font-display tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 h-8 w-8 rounded-full flex items-center justify-center hover:bg-m3-hover transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
