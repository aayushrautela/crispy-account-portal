import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Card, CardRow } from '../components/Card'
import { Spinner } from '../components/Spinner'
import avatarImg from '../assets/avatar.png'

export function DashboardPage() {
  const navigate = useNavigate()
  
  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me.get(),
  })

  if (isLoading) return <Spinner />
  if (!me) return <p className="text-stone-500 font-sans p-6">Failed to load.</p>

  const { user, accountSettings, profiles } = me as any
  const userName = user.email ? user.email.split('@')[0] : 'User'
  const userEmail = user.email || 'guest@example.com'
  const profileCount = Array.isArray(profiles) ? profiles.length : 0
  const tier = String(accountSettings?.pricingTier ?? 'free')

  // Icons used inside M3 tiles and cards
  const icons = {
    personal: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    security: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    privacy: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    people: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    payments: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    storage: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    key: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 002 2m0 0a2 2 0 01-2 2m0 0a2 2 0 01-2-2m0 0V5a2 2 0 10-4 0v2m-6 4h12M5 15h14" />
      </svg>
    ),
    chevron: (
      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    ),
    chevronDown: (
      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    ),
    camera: (
      <svg className="w-3.5 h-3.5 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* ----------------- DESKTOP LAYOUT (lg:flex) ----------------- */}
      <div className="hidden lg:flex flex-col gap-8">
        
        {/* Editorial Greeting Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-wide font-display text-stone-100 capitalize">
            Welcome, {userName}
          </h1>
          <p className="text-sm text-stone-400 font-sans tracking-wide">
            Manage your info, privacy, and security to make Crispy work better for you.
          </p>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Personal Info */}
          <Card interactive onClick={() => navigate('/account')} className="flex flex-col justify-between h-[210px]">
            <div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-m3-green/10 text-m3-green text-xl mb-4">
                {icons.personal}
              </div>
              <h3 className="text-lg font-medium text-stone-100 font-display tracking-wide">Personal info</h3>
              <p className="text-xs text-stone-400 font-sans mt-2 tracking-wide leading-relaxed">
                See your email settings, subscription status details, and basic account definitions.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-stone-500 font-medium truncate max-w-[80%]">{userEmail}</span>
              {icons.chevron}
            </div>
          </Card>

          {/* Card 2: Security */}
          <Card interactive onClick={() => navigate('/api-keys')} className="flex flex-col justify-between h-[210px]">
            <div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-m3-blue/10 text-m3-blue text-xl mb-4">
                {icons.security}
              </div>
              <h3 className="text-lg font-medium text-stone-100 font-display tracking-wide">Security & keys</h3>
              <p className="text-xs text-stone-400 font-sans mt-2 tracking-wide leading-relaxed">
                Configure your OpenRouter key, MDBList key, and generate personal API keys.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-stone-500 font-medium">Protect credentials</span>
              {icons.chevron}
            </div>
          </Card>

          {/* Card 3: Profiles */}
          <Card interactive onClick={() => navigate('/profiles')} className="flex flex-col justify-between h-[210px]">
            <div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-m3-purple/10 text-m3-purple text-xl mb-4">
                {icons.privacy}
              </div>
              <h3 className="text-lg font-medium text-stone-100 font-display tracking-wide">Data & profiles</h3>
              <p className="text-xs text-stone-400 font-sans mt-2 tracking-wide leading-relaxed">
                Manage your user profiles, specify regional filters, language selections, and kid profiles.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-stone-500 font-medium">{profileCount} active profile(s)</span>
              {icons.chevron}
            </div>
          </Card>

          {/* Card 4: Imports */}
          <Card interactive onClick={() => navigate('/provider-imports')} className="flex flex-col justify-between h-[210px]">
            <div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-m3-pink/10 text-m3-pink text-xl mb-4">
                {icons.people}
              </div>
              <h3 className="text-lg font-medium text-stone-100 font-display tracking-wide">Imports & sharing</h3>
              <p className="text-xs text-stone-400 font-sans mt-2 tracking-wide leading-relaxed">
                Sync with external services, check on connection states, and inspect logs of import runs.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-stone-500 font-medium">Sync watch lists</span>
              {icons.chevron}
            </div>
          </Card>

          {/* Card 5: Add-ons */}
          <Card interactive onClick={() => navigate('/addons')} className="flex flex-col justify-between h-[210px]">
            <div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-m3-orange/10 text-m3-orange text-xl mb-4">
                {icons.payments}
              </div>
              <h3 className="text-lg font-medium text-stone-100 font-display tracking-wide">Payments & add-ons</h3>
              <p className="text-xs text-stone-400 font-sans mt-2 tracking-wide leading-relaxed">
                Customize your account with extension manifest URLs and toggle third-party libraries.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-stone-500 font-medium">Manage extensions</span>
              {icons.chevron}
            </div>
          </Card>

          {/* Card 6: Storage & Tier */}
          <Card interactive onClick={() => navigate('/account')} className="flex flex-col justify-between h-[210px]">
            <div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#8f6d40]/15 text-[#e6b473] text-xl mb-4">
                {icons.storage}
              </div>
              <h3 className="text-lg font-medium text-stone-100 font-display tracking-wide">Crispy storage</h3>
              <p className="text-xs text-stone-400 font-sans mt-1 tracking-wide">
                Pricing tier: <strong className="text-stone-300 capitalize">{tier}</strong>
              </p>
              
              {/* Storage progress bar mockup matching screenshot */}
              <div className="w-full bg-[#2d2d2d] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#e6b473] h-full rounded-full w-[25%]" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-stone-500 font-medium">25% used · Tier: {tier}</span>
              {icons.chevron}
            </div>
          </Card>

        </div>
      </div>


      {/* ----------------- MOBILE LAYOUT (lg:hidden) ----------------- */}
      <div className="lg:hidden flex flex-col gap-6 px-1">
        
        {/* User Account Info Header Block */}
        <div className="flex flex-col items-center text-center mt-4 mb-2">
          
          {/* Feline avatar with camera overlay */}
          <div className="relative">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#34a853] bg-stone-800 shadow-md">
              <img src={avatarImg} alt="Avatar profile" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#2d2d2d] border border-m3-border/30 flex items-center justify-center shadow">
              {icons.camera}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-stone-100 font-display mt-4 capitalize leading-tight">
            {userName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 cursor-pointer hover:bg-m3-hover px-3 py-1 rounded-full transition-all">
            <span className="text-xs text-stone-400">{userEmail}</span>
            <div className="h-5 w-5 rounded-full bg-m3-hover/50 flex items-center justify-center">
              {icons.chevronDown}
            </div>
          </div>
        </div>

        {/* Grouped Lists (Matching screenshot 1 groupings) */}
        <div className="flex flex-col gap-4">
          
          {/* Group 1: Personal Info (Single Card) */}
          <Card noPadding>
            <CardRow
              icon={icons.personal}
              iconBgColor="green"
              title="Personal info"
              description="Name, email, phone, address"
              rightElement={icons.chevron}
              onClick={() => navigate('/account')}
            />
          </Card>

          {/* Group 2: Security & Credentials (Grouped Stack) */}
          <Card noPadding>
            <CardRow
              icon={icons.security}
              iconBgColor="blue"
              title="Security & sign-in"
              description="Recent security events, credentials, settings"
              rightElement={icons.chevron}
              onClick={() => navigate('/api-keys')}
            />
            <CardRow
              icon={icons.key}
              iconBgColor="blue"
              title="OpenRouter key"
              description="Configure secure OpenAI/LLM gateway credentials"
              rightElement={icons.chevron}
              onClick={() => navigate('/account')}
            />
            <CardRow
              icon={icons.key}
              iconBgColor="blue"
              title="MDBList key"
              description="Set up movie index databases connector key"
              rightElement={icons.chevron}
              onClick={() => navigate('/account')}
            />
          </Card>

          {/* Group 3: Data & Privacy (Single Card) */}
          <Card noPadding>
            <CardRow
              icon={icons.privacy}
              iconBgColor="purple"
              title="Data & privacy"
              description="History settings, apps and services, profile definitions"
              rightElement={icons.chevron}
              onClick={() => navigate('/profiles')}
            />
          </Card>

          {/* Group 4: People & Profiles (Grouped Stack) */}
          <Card noPadding>
            <CardRow
              icon={icons.people}
              iconBgColor="pink"
              title="People & sharing"
              description="Contacts, blocked users, location sharing, imports"
              rightElement={icons.chevron}
              onClick={() => navigate('/provider-imports')}
            />
            <CardRow
              icon={icons.personal}
              iconBgColor="pink"
              title="Profiles"
              description={`${profileCount} active profile(s) loaded`}
              rightElement={icons.chevron}
              onClick={() => navigate('/profiles')}
            />
          </Card>

          {/* Group 5: Payments & Addons (Grouped Stack) */}
          <Card noPadding>
            <CardRow
              icon={icons.payments}
              iconBgColor="orange"
              title="Payments & subscriptions"
              description="Purchases, active add-on systems"
              rightElement={icons.chevron}
              onClick={() => navigate('/addons')}
            />
            <CardRow
              icon={icons.storage}
              iconBgColor="orange"
              title="Crispy Storage"
              description={`Tier: ${tier} (25% used)`}
              rightElement={icons.chevron}
              onClick={() => navigate('/account')}
            />
          </Card>
          
        </div>
      </div>

    </div>
  )
}
