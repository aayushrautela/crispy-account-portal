export function SignedOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-m3-bg text-[#e3e3e3] px-4 font-sans">
      <div className="text-center max-w-md w-full bg-m3-surface rounded-3xl p-8 shadow-2xl">
        <div className="h-16 w-16 bg-m3-green/10 text-m3-green rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-100 font-display mb-2">Signed Out</h1>
        <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto">
          You have been securely signed out. Please return to the primary Crispy application to sign back in.
        </p>
      </div>
    </div>
  )
}
