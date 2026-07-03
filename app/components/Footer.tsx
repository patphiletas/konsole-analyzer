const STACK = ['Next.js', 'TypeScript', 'Groq', 'Upstash', 'Tailwind CSS', 'Vitest']

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-4 text-xs text-zinc-400 sm:flex-row sm:justify-between lg:px-8">
        <span>© {new Date().getFullYear()} Kpratik — Patrice Philetas</span>
        <span className="text-center">{STACK.join(' · ')}</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/patricephiletas"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-700"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/patricephiletas"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-700"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
