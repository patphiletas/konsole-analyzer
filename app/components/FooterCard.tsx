import type { FooterSignals } from '@/lib/types'

export function FooterCard({ footerSignals }: { footerSignals: FooterSignals }) {
  const hasContent =
    footerSignals.certifications.length > 0 ||
    footerSignals.socialLinks.length > 0 ||
    footerSignals.notableLinks.length > 0 ||
    footerSignals.copyrightYear ||
    footerSignals.legalForm ||
    footerSignals.headquarters

  if (!hasContent) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-zinc-950">Signaux footer</h3>
      <dl className="mt-4 grid gap-2 sm:grid-cols-3">
        {footerSignals.copyrightYear && (
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">Actif depuis</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">{footerSignals.copyrightYear}</dd>
          </div>
        )}
        {footerSignals.legalForm && (
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">Forme juridique</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">{footerSignals.legalForm}</dd>
          </div>
        )}
        {footerSignals.headquarters && (
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">Siège</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">{footerSignals.headquarters}</dd>
          </div>
        )}
      </dl>
      {footerSignals.certifications.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-zinc-500">Certifications</p>
          <div className="flex flex-wrap gap-2">
            {footerSignals.certifications.map((c) => (
              <span key={c} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">{c}</span>
            ))}
          </div>
        </div>
      )}
      {footerSignals.socialLinks.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-zinc-500">Réseaux sociaux</p>
          <div className="flex flex-wrap gap-2">
            {footerSignals.socialLinks.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-100">
                {s.name}
              </a>
            ))}
          </div>
        </div>
      )}
      {footerSignals.notableLinks.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-zinc-500">Liens utiles</p>
          <div className="flex flex-wrap gap-2">
            {footerSignals.notableLinks.map((l) => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                {l.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
