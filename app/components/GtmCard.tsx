export function GtmCard({ gtmSignals }: { gtmSignals: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-zinc-950">Signaux GTM détectés</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {gtmSignals.length > 0 ? (
          gtmSignals.map((signal) => (
            <span key={signal} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              {signal}
            </span>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Aucun signal fort détecté sur la page analysée.</p>
        )}
      </div>
    </div>
  )
}
