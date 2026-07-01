import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  body: string
}

export function EmptyState({ icon: Icon, title, body }: EmptyStateProps) {
  return (
    <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <div>
        <Icon className="mx-auto mb-4 h-9 w-9 text-zinc-500" aria-hidden="true" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">{body}</p>
      </div>
    </div>
  )
}
