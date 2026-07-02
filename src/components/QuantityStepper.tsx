import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  theme: 'light' | 'dark'
  onChange: (value: number) => void
}

export function QuantityStepper({ value, theme, onChange }: QuantityStepperProps) {
  const dark = theme === 'dark'

  return (
    <div className={`grid h-11 grid-cols-3 overflow-hidden rounded-[14px] ring-1 ${dark ? 'bg-white/6 text-white ring-white/10' : 'bg-white text-[#202223] ring-black/8'}`}>
      <button className={`grid place-items-center disabled:opacity-40 ${dark ? 'hover:bg-white/10' : 'hover:bg-[#f1f2f4]'}`} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="grid place-items-center text-sm font-bold">{value}</div>
      <button className={`grid place-items-center ${dark ? 'hover:bg-white/10' : 'hover:bg-[#f1f2f4]'}`} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
