export function DnsCard({ emailProvider, dnsTools }: { emailProvider: string; dnsTools: string[] }) {
  if (dnsTools.length === 0 && emailProvider === 'Unknown') return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-zinc-950">Outils détectés via DNS</h3>
      {emailProvider !== 'Unknown' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
          <span className="font-medium text-zinc-800">Email :</span>
          {emailProvider}
        </div>
      )}
      {dnsTools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {dnsTools.map((tool) => (
            <span key={tool} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800">
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
