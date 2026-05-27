export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className ?? ''}`}>
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-stone-500 border-t-transparent" />
    </div>
  )
}
