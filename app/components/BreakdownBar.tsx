function barColor(ratio: number): string {
  if (ratio >= 0.8) return '#10b981'
  if (ratio >= 0.5) return '#3b82f6'
  if (ratio >= 0.3) return '#f59e0b'
  return '#ef4444'
}

export function BreakdownBar({ label, value, max }: { label: string; value: number; max: number }) {
  const ratio = Math.min(1, value / max)
  const width = `${Math.round(ratio * 100)}%`
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-600">{label}</span>
        <span className="tabular-nums text-zinc-400">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100">
        <div className="h-full rounded-full" style={{ width, backgroundColor: barColor(ratio) }} />
      </div>
    </div>
  )
}
