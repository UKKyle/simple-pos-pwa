import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  body: string
  theme?: 'light' | 'dark'
}

export function EmptyState({ icon: Icon, title, body, theme = 'dark' }: EmptyStateProps) {
  const dark = theme === 'dark'

  return (
    <div className={`grid min-h-56 place-items-center rounded-2xl border border-dashed p-8 text-center ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-black/12 bg-[#f8fafc]'}`}>
      <div>
        <Icon className={`mx-auto mb-4 h-9 w-9 ${dark ? 'text-zinc-500' : 'text-[#9aa0a6]'}`} aria-hidden="true" />
        <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-[#202223]'}`}>{title}</h3>
        <p className={`mt-2 max-w-sm text-sm ${dark ? 'text-zinc-400' : 'text-[#6d7175]'}`}>{body}</p>
      </div>
    </div>
  )
}
