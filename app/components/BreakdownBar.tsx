export function BreakdownBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.min(100, Math.round((value / max) * 100))}%`
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="tabular-nums text-zinc-500">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-200">
        <div className="h-full rounded-full bg-zinc-900" style={{ width }} />
      </div>
    </div>
  )
}
