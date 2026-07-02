import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
}

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="grid h-11 grid-cols-3 overflow-hidden rounded-[14px] bg-white text-[#202223] ring-1 ring-black/8">
      <button className="grid place-items-center hover:bg-[#f1f2f4] disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="grid place-items-center text-sm font-bold">{value}</div>
      <button className="grid place-items-center hover:bg-[#f1f2f4]" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
