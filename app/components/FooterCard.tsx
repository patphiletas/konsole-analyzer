import type { FooterSignals } from '@/lib/types'

const LEGAL_FORM_LABELS: Record<string, { full: string; country: string }> = {
  'LLC':   { full: 'Société à responsabilité limitée',      country: 'États-Unis' },
  'Inc.':  { full: 'Société par actions',                   country: 'États-Unis' },
  'Inc':   { full: 'Société par actions',                   country: 'États-Unis' },
  'Corp.': { full: 'Corporation',                           country: 'États-Unis' },
  'Corp':  { full: 'Corporation',                           country: 'États-Unis' },
  'Ltd.':  { full: 'Société à responsabilité limitée',      country: 'Royaume-Uni' },
  'Ltd':   { full: 'Société à responsabilité limitée',      country: 'Royaume-Uni' },
  'PLC':   { full: 'Société cotée en bourse',               country: 'Royaume-Uni' },
  'LLP':   { full: 'Société de personnes à responsabilité limitée', country: 'États-Unis / UK' },
  'LP':    { full: 'Société en commandite',                 country: 'États-Unis' },
  'SAS':   { full: 'Société par actions simplifiée',        country: 'France' },
  'SARL':  { full: 'Société à responsabilité limitée',      country: 'France' },
  'SA':    { full: 'Société anonyme',                       country: 'France / Europe' },
  'SCI':   { full: 'Société civile immobilière',            country: 'France' },
  'GmbH':  { full: 'Société à responsabilité limitée',      country: 'Allemagne' },
  'AG':    { full: 'Société anonyme cotée',                 country: 'Allemagne / Suisse' },
  'BV':    { full: 'Société privée à responsabilité limitée', country: 'Pays-Bas' },
  'NV':    { full: 'Société anonyme',                       country: 'Pays-Bas / Belgique' },
}

function resolveLegalForm(value: string): { label: string; sub?: string } {
  const key = Object.keys(LEGAL_FORM_LABELS).find((k) =>
    value.toLowerCase().includes(k.toLowerCase()),
  )
  if (!key) return { label: value }
  const { full, country } = LEGAL_FORM_LABELS[key]
  return { label: value, sub: `${full} · ${country}` }
}

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
            <dt className="text-xs text-zinc-500">Copyright footer</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">© {footerSignals.copyrightYear}</dd>
          </div>
        )}
        {footerSignals.legalForm && (() => {
          const { label, sub } = resolveLegalForm(footerSignals.legalForm)
          return (
            <div className="rounded-md bg-zinc-50 p-3">
              <dt className="text-xs text-zinc-500">Forme juridique</dt>
              <dd className="mt-0.5 font-medium text-zinc-950">{label}</dd>
              {sub && <dd className="mt-0.5 text-xs text-zinc-400">{sub}</dd>}
            </div>
          )
        })()}
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
