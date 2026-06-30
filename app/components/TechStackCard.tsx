import type { TechSignal } from '@/lib/types'

export function TechStackCard({ techStack }: { techStack: TechSignal[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-950">Stack technique estimée</h3>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Confirmé
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Probable
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-300" />Indicatif
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {techStack.length > 0 ? (
          techStack.map((tech) => (
            <span
              key={tech.name}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800"
              title={
                tech.confidence === 'high'
                  ? 'Détecté dans les scripts chargés'
                  : tech.confidence === 'medium'
                    ? 'Détecté dans le HTML'
                    : 'Mentionné dans le contenu'
              }
            >
              <span className={`inline-block h-2 w-2 rounded-full ${
                tech.confidence === 'high' ? 'bg-emerald-500'
                  : tech.confidence === 'medium' ? 'bg-amber-400'
                    : 'bg-zinc-300'
              }`} />
              {tech.name}
            </span>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Stack non concluante depuis les scripts publics.</p>
        )}
      </div>
    </div>
  )
}
