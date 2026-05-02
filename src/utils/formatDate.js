const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
const fmtLong = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export function formatDate(val) {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d) ? String(val) : fmt.format(d)
}

export function formatDateTime(val) {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d) ? String(val) : fmtLong.format(d)
}

export function formatRelative(val) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d)) return String(val)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return fmt.format(d)
}
