'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCASCADEStore } from '@/lib/store/cascade-store'
import { getSovereigntyStatus } from '@/lib/cascade/sovereignty'

// Icons as simple SVG components
const Icons = {
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sovereignty: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Pyramid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18M7 14h10" />
    </svg>
  ),
  Reality: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Oracle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Journal: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: Icons.Home },
  { href: '/sovereignty', label: 'Sovereignty', icon: Icons.Sovereignty },
  { href: '/pyramid', label: 'Knowledge', icon: Icons.Pyramid },
  { href: '/reality', label: 'Reality Bridge', icon: Icons.Reality },
  { href: '/oracle', label: 'Oracle', icon: Icons.Oracle },
  { href: '/journal', label: 'Journal', icon: Icons.Journal },
]

export function Navigation() {
  const pathname = usePathname()
  const sovereignty = useCASCADEStore(state => state.sovereignty)
  const status = getSovereigntyStatus(sovereignty.humanSovereignty.value)
  
  return (
    <nav className="w-64 bg-zinc-900/50 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-sovereignty flex items-center justify-center">
            <Icons.Pyramid />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-100">CASCADE</h1>
            <p className="text-xs text-zinc-500">Living OS</p>
          </div>
        </div>
      </div>
      
      {/* Sovereignty Status */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="cascade-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Sovereignty</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              status.label === 'SOVEREIGN' ? 'status-sovereign' :
              status.label === 'STABLE' ? 'status-stable' :
              status.label === 'DRIFTING' ? 'status-drifting' :
              'status-critical'
            }`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className={`metric-value ${status.color}`}>
              {(sovereignty.humanSovereignty.value * 100).toFixed(0)}
            </span>
            <span className="text-zinc-500 text-sm mb-1">%</span>
          </div>
          <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                status.label === 'SOVEREIGN' ? 'bg-emerald-500' :
                status.label === 'STABLE' ? 'bg-cyan-500' :
                status.label === 'DRIFTING' ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${sovereignty.humanSovereignty.value * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-zinc-800/50 text-cyan-400 border-l-2 border-cyan-400 ml-0 pl-3.5' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
              }`}
            >
              <Icon />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 rounded-lg transition-all"
        >
          <Icons.Settings />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        
        <div className="mt-4 px-4 text-xs text-zinc-600">
          <p>CASCADE v1.0.0</p>
          <p className="mt-1">Phase: <span className="text-cyan-500">{sovereignty.phase}</span></p>
        </div>
      </div>
    </nav>
  )
}
