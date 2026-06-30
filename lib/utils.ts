export function buildFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

export function buildScreenshotUrl(domain: string): string {
  return `https://image.thum.io/get/width/1280/crop/800/https://${domain}`
}

export function resolveFaviconUrl(
  favicon: string | undefined,
  hostname: string,
  fallback: string,
): string {
  if (!favicon) return fallback
  try {
    const resolved = new URL(favicon, `https://${hostname}`)
    if (!['http:', 'https:'].includes(resolved.protocol)) return fallback
    return resolved.href
  } catch {
    return fallback
  }
}
