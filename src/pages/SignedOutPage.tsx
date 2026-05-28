export function SignedOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-m3-bg text-[#e3e3e3] px-4 font-sans">
      <div className="text-center max-w-md w-full bg-m3-surface rounded-3xl p-8 border border-m3-border/10 shadow-2xl">
        <div className="h-16 w-16 bg-[#34a853]/10 text-[#34a853] rounded-full flex items-center justify-center mx-auto mb-5 text-2xl shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-100 font-display tracking-wide mb-2">Signed Out</h1>
        <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto">
          You have been securely signed out. Please return to the primary Crispy application to sign back in.
        </p>
      </div>
    </div>
  )
}
